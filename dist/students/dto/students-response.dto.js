"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentGradesResponseDto = exports.StudentAttendanceResponseDto = exports.StudentAcademicRecordsResponseDto = exports.ParentChildrenResponseDto = exports.AttendanceRecordDto = exports.AcademicRecordDto = exports.StudentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class StudentDto {
    id;
    studentNumber;
    name;
    email;
    phone;
    avatar;
    status;
    currentClass;
    currentLevel;
    academicYear;
    enrollmentDate;
    school;
}
exports.StudentDto = StudentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student ID' }),
    __metadata("design:type", String)
], StudentDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student number' }),
    __metadata("design:type", String)
], StudentDto.prototype, "studentNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student name' }),
    __metadata("design:type", String)
], StudentDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student email' }),
    __metadata("design:type", String)
], StudentDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student phone' }),
    __metadata("design:type", String)
], StudentDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student avatar URL' }),
    __metadata("design:type", String)
], StudentDto.prototype, "avatar", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student status' }),
    __metadata("design:type", String)
], StudentDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current class' }),
    __metadata("design:type", String)
], StudentDto.prototype, "currentClass", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current level' }),
    __metadata("design:type", String)
], StudentDto.prototype, "currentLevel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Academic year' }),
    __metadata("design:type", String)
], StudentDto.prototype, "academicYear", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enrollment date' }),
    __metadata("design:type", Date)
], StudentDto.prototype, "enrollmentDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'School information' }),
    __metadata("design:type", Object)
], StudentDto.prototype, "school", void 0);
class AcademicRecordDto {
    id;
    subject;
    assignment;
    score;
    maxScore;
    grade;
    percentage;
    gpa;
    comments;
    feedback;
    gradedAt;
    term;
    teacher;
}
exports.AcademicRecordDto = AcademicRecordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Record ID' }),
    __metadata("design:type", String)
], AcademicRecordDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Subject name' }),
    __metadata("design:type", String)
], AcademicRecordDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Assignment name' }),
    __metadata("design:type", String)
], AcademicRecordDto.prototype, "assignment", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Score obtained' }),
    __metadata("design:type", Number)
], AcademicRecordDto.prototype, "score", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Maximum possible score' }),
    __metadata("design:type", Number)
], AcademicRecordDto.prototype, "maxScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Grade letter' }),
    __metadata("design:type", String)
], AcademicRecordDto.prototype, "grade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Percentage score' }),
    __metadata("design:type", Number)
], AcademicRecordDto.prototype, "percentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'GPA points' }),
    __metadata("design:type", Number)
], AcademicRecordDto.prototype, "gpa", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Teacher comments' }),
    __metadata("design:type", String)
], AcademicRecordDto.prototype, "comments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Teacher feedback' }),
    __metadata("design:type", String)
], AcademicRecordDto.prototype, "feedback", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Graded date' }),
    __metadata("design:type", Date)
], AcademicRecordDto.prototype, "gradedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Term information' }),
    __metadata("design:type", Object)
], AcademicRecordDto.prototype, "term", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Teacher information' }),
    __metadata("design:type", Object)
], AcademicRecordDto.prototype, "teacher", void 0);
class AttendanceRecordDto {
    id;
    date;
    status;
    checkInTime;
    checkOutTime;
    notes;
    class;
    subject;
}
exports.AttendanceRecordDto = AttendanceRecordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Attendance record ID' }),
    __metadata("design:type", String)
], AttendanceRecordDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Attendance date' }),
    __metadata("design:type", Date)
], AttendanceRecordDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Attendance status' }),
    __metadata("design:type", String)
], AttendanceRecordDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Check-in time' }),
    __metadata("design:type", Date)
], AttendanceRecordDto.prototype, "checkInTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Check-out time' }),
    __metadata("design:type", Date)
], AttendanceRecordDto.prototype, "checkOutTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notes' }),
    __metadata("design:type", String)
], AttendanceRecordDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Class information' }),
    __metadata("design:type", Object)
], AttendanceRecordDto.prototype, "class", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Subject information' }),
    __metadata("design:type", Object)
], AttendanceRecordDto.prototype, "subject", void 0);
class ParentChildrenResponseDto {
    children;
    total;
}
exports.ParentChildrenResponseDto = ParentChildrenResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'List of children', type: [StudentDto] }),
    __metadata("design:type", Array)
], ParentChildrenResponseDto.prototype, "children", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of children' }),
    __metadata("design:type", Number)
], ParentChildrenResponseDto.prototype, "total", void 0);
class StudentAcademicRecordsResponseDto {
    student;
    academicRecords;
    total;
    averageGpa;
    overallGrade;
}
exports.StudentAcademicRecordsResponseDto = StudentAcademicRecordsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student information' }),
    __metadata("design:type", StudentDto)
], StudentAcademicRecordsResponseDto.prototype, "student", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Academic records', type: [AcademicRecordDto] }),
    __metadata("design:type", Array)
], StudentAcademicRecordsResponseDto.prototype, "academicRecords", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of records' }),
    __metadata("design:type", Number)
], StudentAcademicRecordsResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Average GPA' }),
    __metadata("design:type", Number)
], StudentAcademicRecordsResponseDto.prototype, "averageGpa", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Overall grade' }),
    __metadata("design:type", String)
], StudentAcademicRecordsResponseDto.prototype, "overallGrade", void 0);
class StudentAttendanceResponseDto {
    student;
    attendanceRecords;
    total;
    attendancePercentage;
    presentDays;
    absentDays;
    lateDays;
}
exports.StudentAttendanceResponseDto = StudentAttendanceResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student information' }),
    __metadata("design:type", StudentDto)
], StudentAttendanceResponseDto.prototype, "student", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Attendance records', type: [AttendanceRecordDto] }),
    __metadata("design:type", Array)
], StudentAttendanceResponseDto.prototype, "attendanceRecords", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of records' }),
    __metadata("design:type", Number)
], StudentAttendanceResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Attendance percentage' }),
    __metadata("design:type", Number)
], StudentAttendanceResponseDto.prototype, "attendancePercentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Present days' }),
    __metadata("design:type", Number)
], StudentAttendanceResponseDto.prototype, "presentDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Absent days' }),
    __metadata("design:type", Number)
], StudentAttendanceResponseDto.prototype, "absentDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Late days' }),
    __metadata("design:type", Number)
], StudentAttendanceResponseDto.prototype, "lateDays", void 0);
class StudentGradesResponseDto {
    students;
    total;
}
exports.StudentGradesResponseDto = StudentGradesResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'List of students with their grades', type: [StudentAcademicRecordsResponseDto] }),
    __metadata("design:type", Array)
], StudentGradesResponseDto.prototype, "students", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of students' }),
    __metadata("design:type", Number)
], StudentGradesResponseDto.prototype, "total", void 0);
//# sourceMappingURL=students-response.dto.js.map