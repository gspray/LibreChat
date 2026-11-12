const assert = require('node:assert/strict');
const test = require('node:test');
const { caddieSpecsFromTemplate, withCaddieSpecs } = require('./ensure-student-caddie-spec');

test('student spec comes from the tracked Chat configuration', () => {
  const { instructor, student } = caddieSpecsFromTemplate();
  assert.equal(instructor.name, 'instructor-assistant');
  assert.equal(instructor.label, 'Instructor Assistant');
  assert.equal(instructor.preset.agent_id, 'agent_instructor_assistant');
  assert.equal(student.name, 'student-caddie');
  assert.equal(student.label, 'Student Caddie');
  assert.equal(student.iconURL, 'https://chat.ssmlabs.com/assets/student-caddie.png');
  assert.equal(student.preset.endpoint, 'agents');
  assert.equal(student.preset.agent_id, 'agent_student_caddie');
  assert.deepEqual(student.mcpServers, ['lessoncaddie-student']);
});

test('Admin model list replaces the legacy OpenAI instructor entry and remains stable', () => {
  const specs = caddieSpecsFromTemplate();
  const once = withCaddieSpecs(
    [{ name: 'LessonCaddieModel', preset: { endpoint: 'openAI' } }, { name: 'other-model' }],
    specs,
  );
  assert.deepEqual(once, [specs.instructor, specs.student, { name: 'other-model' }]);
  assert.deepEqual(withCaddieSpecs(once, specs), once);
  assert.equal(withCaddieSpecs(null, specs), null);
});
