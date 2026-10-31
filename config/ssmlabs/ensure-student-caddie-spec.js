/** Keep the student entry available when Admin config replaces the YAML model list. */
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');

const SPEC_NAME = 'student-caddie';

function studentSpecFromTemplate(
  filePath = path.resolve(__dirname, '../instructor-assistant.librechat.yaml'),
) {
  const template = yaml.load(fs.readFileSync(filePath, 'utf8'));
  const spec = template.modelSpecs?.list?.find((item) => item.name === SPEC_NAME);
  if (
    !spec ||
    spec.preset?.endpoint !== 'openAI' ||
    JSON.stringify(spec.mcpServers) !== JSON.stringify(['lessoncaddie-student'])
  ) {
    throw new Error('The student Caddie model specification is missing or invalid.');
  }
  return spec;
}

function withStudentSpec(list, studentSpec) {
  if (!Array.isArray(list)) return null;
  const instructorSpecs = list
    .filter((spec) => spec?.name !== SPEC_NAME)
    .map((spec) => {
      if (
        (spec?.name === 'LessonCaddieModel' || spec?.name === 'instructor-assistant') &&
        !spec.iconURL
      ) {
        return { ...spec, iconURL: studentSpec.iconURL };
      }
      return spec;
    });
  return [...instructorSpecs, studentSpec];
}

async function main() {
  const mongoose = require('mongoose');
  const connect = require('../connect');
  await connect();
  const collection = mongoose.connection.db.collection('configs');
  const base = await collection.findOne({ principalId: '__base__' });
  const current = base?.overrides?.modelSpecs?.list;
  if (!Array.isArray(current)) {
    console.log('No Admin model list override; student Caddie comes from YAML.');
    await mongoose.disconnect();
    return;
  }
  const next = withStudentSpec(
    current,
    studentSpecFromTemplate(path.resolve(__dirname, '../../librechat.yaml')),
  );
  const result = await collection.updateOne(
    { _id: base._id, 'overrides.modelSpecs.list': current },
    { $set: { 'overrides.modelSpecs.list': next } },
  );
  if (result.matchedCount !== 1) {
    throw new Error('Admin model list changed during student Caddie update.');
  }
  console.log('Student Caddie model specification is available in Admin config.');
  await mongoose.disconnect();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = { studentSpecFromTemplate, withStudentSpec };
