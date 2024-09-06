// Certificate.virtual.model.js
const User = require('./User.model');

// Añadir campo virtual para obtener el certificado del usuario
User.schema.virtual('certificateDetails', {
  ref: 'Course',
  localField: 'courses.course',
  foreignField: '_id',
  justOne: false,  // Se obtiene una lista de cursos relacionados
});

// Añadir campo virtual para obtener los detalles de la compañía
User.schema.virtual('companyDetails', {
  ref: 'Company',
  localField: 'company',
  foreignField: '_id',
  justOne: true  // Solo se obtiene una compañía
});

// Asegurarse de que el esquema incluya los virtuals en el resultado JSON
User.schema.set('toJSON', { virtuals: true });

module.exports = User;