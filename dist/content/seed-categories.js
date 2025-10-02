"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function seedCategories() {
    console.log('Seeding content and subject categories...');
    const contentCategories = [
        { name: 'textbook', description: 'Comprehensive educational books' },
        { name: 'worksheet', description: 'Practice exercises and problems' },
        { name: 'assignment', description: 'Tasks or projects for evaluation' },
        { name: 'video_course', description: 'Educational video series' },
        { name: 'past_questions', description: 'Previous exam papers' },
        { name: 'audio_book', description: 'Audio versions of books' },
        { name: 'interactive', description: 'Quizzes, games, simulations' },
        { name: 'notes', description: 'Summarized lecture or study notes' },
        { name: 'assessment', description: 'Tests and evaluations' },
        { name: 'other', description: 'Miscellaneous educational content' },
    ];
    const subjectCategories = [
        { name: 'mathematics', description: 'Study of numbers, quantity, and space' },
        { name: 'computer_science', description: 'Study of computation and information' },
        { name: 'business', description: 'Study of commerce, trade, and management' },
        { name: 'engineering', description: 'Application of science and math to design and build' },
        { name: 'medicine', description: 'Science of healing' },
        { name: 'law', description: 'System of rules regulating society' },
        { name: 'arts', description: 'Arts & Humanities' },
        { name: 'sciences', description: 'Natural Sciences' },
        { name: 'social_sciences', description: 'Social Sciences' },
        { name: 'other', description: 'General or unclassified subjects' },
    ];
    for (const category of contentCategories) {
        await prisma.contentCategory.upsert({
            where: { name: category.name },
            update: {},
            create: category,
        });
    }
    for (const category of subjectCategories) {
        await prisma.subjectCategory.upsert({
            where: { name: category.name },
            update: {},
            create: category,
        });
    }
    console.log('Categories seeded successfully!');
}
seedCategories()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-categories.js.map