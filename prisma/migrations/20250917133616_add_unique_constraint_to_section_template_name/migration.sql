/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `section_templates` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "section_templates_name_key" ON "public"."section_templates"("name");
