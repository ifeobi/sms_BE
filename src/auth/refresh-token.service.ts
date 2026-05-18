import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes, createHash } from 'crypto';

const REFRESH_TOKEN_BYTES = 64;
const REFRESH_TOKEN_TTL_DAYS = 30;
const ACCESS_TOKEN_TTL = '15m';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private generateRawToken(): string {
    return randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
  }

  /** Issue a new access + refresh token pair. Stores hashed refresh in DB. */
  async issueTokenPair(
    payload: Record<string, any>,
    meta: { ipAddress?: string; userAgent?: string } = {},
  ) {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.config.get('ACCESS_TOKEN_TTL') || ACCESS_TOKEN_TTL,
    });

    const rawRefreshToken = this.generateRawToken();
    const tokenHash = this.hash(rawRefreshToken);
    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    );

    await this.prisma.refreshToken.create({
      data: {
        userId: payload.sub,
        tokenHash,
        expiresAt,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      },
    });

    return {
      access_token: accessToken,
      refresh_token: rawRefreshToken,
      expires_in: 15 * 60,
    };
  }

  /** Rotate: validate the incoming refresh token, revoke it, issue a new pair. */
  async rotate(
    rawRefreshToken: string,
    buildPayload: (userId: string) => Promise<Record<string, any>>,
    meta: { ipAddress?: string; userAgent?: string } = {},
  ) {
    const tokenHash = this.hash(rawRefreshToken);
    const record = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!record) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (record.revokedAt) {
      // Reuse detected — revoke all tokens for this user as a precaution.
      await this.prisma.refreshToken.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException(
        'Refresh token reuse detected; all sessions revoked',
      );
    }
    if (record.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const newPayload = await buildPayload(record.userId);
    if (newPayload.sub !== record.userId) {
      throw new UnauthorizedException('Refresh token subject mismatch');
    }

    const pair = await this.issueTokenPair(newPayload, meta);
    const newHash = this.hash(pair.refresh_token);

    await this.prisma.refreshToken.update({
      where: { id: record.id },
      data: {
        revokedAt: new Date(),
        replacedBy: newHash,
      },
    });

    return pair;
  }

  /** Revoke a single refresh token (logout). */
  async revoke(rawRefreshToken: string): Promise<void> {
    const tokenHash = this.hash(rawRefreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /** Revoke every active token for a user (logout from all devices). */
  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
