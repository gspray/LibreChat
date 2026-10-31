const assert = require('node:assert/strict');
const test = require('node:test');
const { studentSpecFromTemplate, withStudentSpec } = require('./ensure-student-caddie-spec');

test('student spec comes from the tracked Chat configuration', () => {
  const student = studentSpecFromTemplate();
  assert.equal(student.name, 'student-caddie');
  assert.equal(student.iconURL, 'assets/caddie.png');
  assert.deepEqual(student.mcpServers, ['lessoncaddie-student']);
});

test('Admin model list keeps instructor entries and gets one student entry', () => {
  const instructor = { name: 'LessonCaddieModel', mcpServers: ['lessoncaddie-instructor'] };
  const student = studentSpecFromTemplate();
  const once = withStudentSpec([instructor], student);
  assert.deepEqual(once, [{ ...instructor, iconURL: 'assets/caddie.png' }, student]);
  assert.deepEqual(withStudentSpec(once, student), once);
  assert.equal(withStudentSpec(null, student), null);
});
