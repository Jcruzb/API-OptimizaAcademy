const Course = require('../models/Course.model');
const User = require('../models/User.model');
const createError = require("http-errors");
const { StatusCodes } = require("http-status-codes");

module.exports.getAll = (req, res, next) => {
    Course.find()
        .then(courses => {
            res.status(StatusCodes.OK).json(courses);
        })
        .catch((err) => {
            console.log(err);
            next(createError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error"));
        });
}

module.exports.create = (req, res, next) => {
    if (req.file) {
        req.body.mainImage = req.file.path;
    }
    const course = new Course(req.body);
    course.save()
        .then(course => {
            console.log(course);
            res.status(StatusCodes.CREATED).json(course);
        })
        .catch((err) => {
            console.log(err);
            next(createError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error"));
        });
};


module.exports.getOne = (req, res, next) => {
    Course.findById(req.params.id)
        .then((course) => {
            if (!course) {
                next(createError(StatusCodes.NOT_FOUND, "Course not found"));
            } else {
                res.status(StatusCodes.OK).json(course);
            }
        })
        .catch((err) => {
            console.log(err);
            next(createError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error"));
        });
}

module.exports.update = (req, res, next) => {
    const id = req.params.id;
    const course = req.body;

    if (req.file) {
        // Actualizar el campo de imagen para que contenga la URL de Cloudinary
        course.image = req.file.path;
    }
    console.log(course);

    Course.findByIdAndUpdate(id, course, { new: true })
        .then(course => {
            if (!course) {
                next(createError(StatusCodes.NOT_FOUND, "Course not found"));
            } else {
                console.log('entrando en update');
                console.log(course)
                res.status(StatusCodes.OK).json(course);
            }
        })
        .catch((err) => {
            console.log(err);
            next(createError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error"));
        });
}


module.exports.updateContentImage = (req, res, next) => {
    const id = req.params.id;
    const contentId = req.body.contentId;
    const updateFields = {};

    if (req.file) {
        updateFields["content.$.image"] = req.file.path;
    }

    Course.findOneAndUpdate(
        { _id: id, "content._id": contentId },
        { $set: updateFields },
        { new: true }
    )
        .then(course => {
            if (!course) {
                next(createError(StatusCodes.NOT_FOUND, "Course not found"));
            } else {
                console.log('entrando en update');
                res.status(StatusCodes.OK).json(course);
                console.log("Content updated");
            }
        })
        .catch((err) => {
            console.log(err);
            next(createError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error"));
        });
};

module.exports.updateMainImage = (req, res, next) => {
    const id = req.params.id;
    const course = req.body;

    if (req.file) {
        // Actualizar el campo de imagen para que contenga la URL de Cloudinary
        course.mainImage = req.file.path;
    }

    Course.findByIdAndUpdate(id, course, { new: true })
        .then(course => {
            if (!course) {
                next(createError(StatusCodes.NOT_FOUND, "Course not found"));
            } else {
                console.log('entrando en update');
                res.status(StatusCodes.OK).json(course);
            }
        })
        .catch((err) => {
            console.log(err);
            next(createError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error"));
        });
}




module.exports.updateContent = (req, res, next) => {
    const id = req.params.id;
    const content = req.body;

    if (req.file) {
        content.image = req.file.path;
    }
    console.log('Entra en updateContent')

    console.log(req.body);

    Course.findByIdAndUpdate(id, { $push: { content: content } }, { new: true })
        .then(course => {
            if (!course) {
                next(createError(StatusCodes.NOT_FOUND, "Course not found"));
            } else {
                console.log('entrando en update');
                console.log(course);
                res.status(StatusCodes.OK).json(course);
            }
        }
        )
        .catch((err) => {
            console.log(err);
            next(createError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error"));
        });
}


module.exports.delete = (req, res, next) => {
    const id = req.params.id;
    Course.findByIdAndDelete(id)
        .then(course => {
            if (!course) {
                next(createError(StatusCodes.NOT_FOUND, "Course not found"));
            } else {
                res.status(StatusCodes.NO_CONTENT).json();
            }
        })
        .catch((err) => {
            console.log(err);
            next(createError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error"));
        });
}

//update student list

module.exports.updateCourseStudent = (req, res, next) => {
    console.log('Entra en updateCourseStudent')
    console.log(req.body);

    const { id } = req.params; // ID del usuario
    const { coursesId } = req.body; // ID del curso

    console.log('id', id);
    console.log('coursesId', coursesId);

    User.findById(id)
        .then((user) => {
            if (!user) {
                return next(createError(StatusCodes.NOT_FOUND, "User not found"));
            }

            const courseIndex = user.courses.findIndex(course => course.course.toString() === coursesId);

            if (courseIndex === -1) {
                // Si el curso no existe, agregarlo
                user.courses.push({ course: coursesId, isActive: true });
            } else {
                // Si el curso ya existe, alternar el estado de isActive
                user.courses[courseIndex].isActive = !user.courses[courseIndex].isActive;
            }

            return user.save();
        })
        .then((updatedUser) => {
            res.status(StatusCodes.OK).json(updatedUser);
        })
        .catch((err) => {
            console.log(err);
            next(createError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error"));
        });
};

module.exports.getTestsByCourse = (req, res, next) => {
    const testId = req.params.id; // Aquí se obtiene el testId desde req.params

    console.log(testId);
    
    Course.findOne({ "tests._id": testId }) // Busca el test dentro de los cursos
        .then((course) => {
            if (!course) {
                return next(createError(StatusCodes.NOT_FOUND, "Course not found"));
            }
            const test = course.tests.id(testId); // Usa .id() de Mongoose para encontrar el test por su ID
            if (!test) {
                return next(createError(StatusCodes.NOT_FOUND, "Test not found"));
            }
            res.status(StatusCodes.OK).json(test);
        })
        .catch((err) => {
            console.log(err);
            next(createError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error"));
        });
}


module.exports.editTest = (req, res, next) => {
    const courseId = req.params.id;
    const testId = req.body._id;
    const updatedTest = req.body;
  
    if (!testId || !updatedTest) {
        return next(createError(StatusCodes.BAD_REQUEST, "Test ID y datos del test son requeridos"));
    }

    Course.findById(courseId)
        .then((course) => {
            if (!course) {
                return next(createError(StatusCodes.NOT_FOUND, "Course not found"));
            }

            const testIndex = course.tests.findIndex(test => test._id.toString() === testId);
            if (testIndex === -1) {
                return next(createError(StatusCodes.NOT_FOUND, "Test not found"));
            }

            
            course.tests[testIndex] = { ...course.tests[testIndex]._doc, ...updatedTest };

            return course.save();
        })
        .then((updatedCourse) => {
            res.status(StatusCodes.OK).json(updatedCourse);
        })
        .catch((err) => {
            console.error(err);
            next(createError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error"));
        });
};
