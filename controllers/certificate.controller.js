// certificate.controller.js
const User = require('../models/Certificate.virtual.model');
const createError = require('http-errors');
const { StatusCodes } = require('http-status-codes');

module.exports.getUserCertificate = (req, res, next) => {
    const { userId, courseId } = req.params;

    User.findById(userId)
        .populate({
            path: 'courses.course',  // Popula los detalles del curso dentro de la lista de cursos del usuario
            model: 'Course'
        })
        .populate('companyDetails')  // Asegúrate de poblar la empresa si es necesario
        .then((user) => {
            if (!user) {
                return next(createError(StatusCodes.NOT_FOUND, "Usuario no encontrado"));
            }

            const course = user.courses.find(
                course => course.course._id.toString() === courseId && course.status === 'completed'
            );

            if (!course) {
                return next(createError(StatusCodes.NOT_FOUND, "Certificado no encontrado o curso no completado/aprobado"));
            }

            res.status(StatusCodes.OK).json({
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                company: {
                    name: user.companyDetails?.name,
                    logo: user.companyDetails?.logo,
                },
                courseName: course.course.name,  // Ahora tienes acceso a `course.course.name`
                courseImage: course.course.mainImage,  // También acceso a la imagen
                examResults: course.examResults,
                dedication: course.dedication,
                startDate: course.startDate,
                courseProgress: course.progress.courseProgressPercent,
                certificateUrl: `/certificates/${userId}/${courseId}`
            });
        })
        .catch((error) => {
            next(createError(StatusCodes.INTERNAL_SERVER_ERROR, error.message));
        });
};