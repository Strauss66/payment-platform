"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const qi = queryInterface;

    // announcement_classes
    await qi.createTable('announcement_classes', {
      announcement_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
      class_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false }
    });
    await qi.addIndex('announcement_classes', ['announcement_id'], { name: 'idx_announcement_classes_announcement' });
    await qi.addIndex('announcement_classes', ['class_id'], { name: 'idx_announcement_classes_class' });
    await qi.addConstraint('announcement_classes', {
      fields: ['announcement_id'],
      type: 'foreign key',
      name: 'fk_announcement_classes_announcement',
      references: { table: 'announcements', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    await qi.addConstraint('announcement_classes', {
      fields: ['class_id'],
      type: 'foreign key',
      name: 'fk_announcement_classes_class',
      references: { table: 'classes', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    await qi.addIndex('announcement_classes', ['announcement_id', 'class_id'], { unique: true, name: 'uniq_announcement_classes' });

    // announcement_students
    await qi.createTable('announcement_students', {
      announcement_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
      student_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false }
    });
    await qi.addIndex('announcement_students', ['announcement_id'], { name: 'idx_announcement_students_announcement' });
    await qi.addIndex('announcement_students', ['student_id'], { name: 'idx_announcement_students_student' });
    await qi.addConstraint('announcement_students', {
      fields: ['announcement_id'],
      type: 'foreign key',
      name: 'fk_announcement_students_announcement',
      references: { table: 'announcements', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    await qi.addConstraint('announcement_students', {
      fields: ['student_id'],
      type: 'foreign key',
      name: 'fk_announcement_students_student',
      references: { table: 'students', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    await qi.addIndex('announcement_students', ['announcement_id', 'student_id'], { unique: true, name: 'uniq_announcement_students' });
  },

  async down(queryInterface) {
    const qi = queryInterface;
    await qi.dropTable('announcement_students');
    await qi.dropTable('announcement_classes');
  }
};


