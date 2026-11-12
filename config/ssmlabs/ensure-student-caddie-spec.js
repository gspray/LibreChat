/** Keep the student entry available when Admin config replaces the YAML model list. */
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');

const SPEC_NAME = 'student-caddie';
const INSTRUCTOR_SPEC_NAME = 'instructor-assistant';

function caddieSpecsFromTemplate(
  filePath = path.resolve(__dirname, '../instructor-assistant.librechat.yaml'),
) {
  const template = yaml.load(fs.readFileSync(filePath, 'utf8'));
  const student = template.modelSpecs?.list?.find((item) => item.name === SPEC_NAME);
  const instructor = template.modelSpecs?.list?.find((item) => item.name === INSTRUCTOR_SPEC_NAME);
  if (
    !student ||
    student.preset?.endpoint !== 'agents' ||
    student.preset?.agent_id !== 'agent_student_caddie' ||
    JSON.stringify(student.mcpServers) !== JSON.stringify(['lessoncaddie-student']) ||
    !instructor ||
    instructor.preset?.endpoint !== 'agents' ||
    instructor.preset?.agent_id !== 'agent_instructor_assistant'
  ) {
    throw new Error('The Caddie model specifications are missing or invalid.');
  }
  return { instructor, student };
}

function withCaddieSpecs(list, { instructor, student }) {
  if (!Array.isArray(list)) return null;
  const otherSpecs = list.filter(
    (spec) =>
      spec?.name !== SPEC_NAME &&
      spec?.name !== INSTRUCTOR_SPEC_NAME &&
      spec?.name !== 'LessonCaddieModel',
  );
  return [instructor, student, ...otherSpecs];
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
  const next = withCaddieSpecs(
    current,
    caddieSpecsFromTemplate(path.resolve(__dirname, '../../librechat.yaml')),
  );
  const result = await collection.updateOne(
    { _id: base._id, 'overrides.modelSpecs.list': current },
    { $set: { 'overrides.modelSpecs.list': next } },
  );
  if (result.matchedCount !== 1) {
    throw new Error('Admin model list changed during student Caddie update.');
  }
  console.log('Instructor and student Caddie model specifications are current in Admin config.');
  await mongoose.disconnect();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = { caddieSpecsFromTemplate, withCaddieSpecs };
