//User controller
const User = require('../models/User.model');
const { StatusCodes } = require('http-status-codes');
const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const Course = require('../models/Course.model');

module.exports.register = (req, res, next) => {
    if (req.file) {
        req.body.avatar = req.file.path;
    }

    const user = new User(req.body);
    user.save()
        .then(user => {
            res.status(StatusCodes.CREATED).json(user);
        })
        .catch((err) => console.log(err));
}

module.exports.login = (req, res, next) => {
    const loginError = () => next(createError(StatusCodes.UNAUTHORIZED, "Invalid email or password"));
    const { email, password } = req.body;

    if (!email || !password) {
        return next(loginError());
    }
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                next(loginError());
            } else {
                return user.checkPassword(password)
                    .then(match => {
                        if (!match) {
                            next(loginError());
                        } else {
                            res.json({
                                access_token: jwt.sign(
                                    { id: user._id },
                                    process.env.JWT_SECRET || "Super secret",
                                    { expiresIn: process.env.JWT_EXPIRES_IN }
                                )
                            });
                        }
                    });
            }
        })
        .catch(next);
}

module.exports.getOne = (req, res, next) => {
    User.findById(req.params.id)
        .populate("courses.course")
        .then((user) => {
            if (!user) {
                return next(createHttpError(StatusCodes.NOT_FOUND, "User not found"));
            }
            const activeCourses = user.courses.filter(course => course.isActive);
            const userWithActiveCourses = {
                ...user.toObject(),
                courses: activeCourses,
            };

            res.status(StatusCodes.OK).json(userWithActiveCourses);
        })
        .catch(next);
};

module.exports.list = (req, res, next) => {
    //lista de usuarios populando la propiedad company
    User.find()
        .populate("company")
        .populate("courses.course")
        .then(users => {
            res.json(users);
        })
        .catch(next);
}

module.exports.update = (req, res, next) => {
    const { id } = req.params;
    if (req.file) {
        req.body.avatar = req.file.path;
    }
    User.findByIdAndUpdate(id, req.body, { new: true })
        .then(user => {
            if (!user) {
                next(createError(StatusCodes.NOT_FOUND, "User not found"));
            } else {
                res.json(user);
            }
        })
        .catch((error) => {
            console.log("error: " + error);
            next(error);
        });
}

module.exports.delete = (req, res, next) => {
    const { id } = req.params;
    User.findByIdAndDelete(id)
        .then(user => {
            if (!user) {
                next(createError(StatusCodes.NOT_FOUND, "User not found"));
            } else {
                res.status(StatusCodes.NO_CONTENT).json();
            }
        })
        .catch(next);
}

module.exports.getCurrentUser = (req, res, next) => {


    User.findById(req.currentUser)
        .populate("company")
        .populate("courses.course")
        .then(user => {
            if (!user) {
                next(createError(StatusCodes.NOT_FOUND, "User not found"));
            } else {
                const activeCourses = user.courses.filter(course => course.isActive);
                const userWithActiveCourses = {
                    ...user.toObject(),
                    courses: activeCourses,
                };
                res.json(userWithActiveCourses);
            }
        })
        .catch((error) => {
            console.log("error: " + error);
            next(error);
        });
}

//actualizar el testResults del usuario

module.exports.updateTestResults = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { testsResults } = req.body;

        const user = await User.findById(id);

        if (!user) {
            return next(createError(StatusCodes.NOT_FOUND, "User not found"));
        }

        const courseTest = user.courses.find(course => {
            const userId = course.course._id.toString();
            return (userId === testsResults.courseId)
        });

        if (!courseTest) {
            return next(createError(StatusCodes.NOT_FOUND, "Course not found"));
        }

        if (!testsResults.testId) {
            courseTest.testsResults = testsResults;
            await user.save();
        } else {
            courseTest.testsResults.push(testsResults);
            await user.save();
        }

        res.json(user);
    } catch (error) {
        console.error("Error:", error);
        next(error);
    }
};


module.exports.updateCourseTime = async (req, res, next) => {
    try {
        const { courseId, dedication } = req.body;
        const { id } = req.params;


        const user = await User.findById(id);

        if (!user) {
            console.log("user not found");
            return next(createError(StatusCodes.NOT_FOUND, "User not found"));
        }


        const courseIndex = user.courses.findIndex(course => course.course._id.toString() === courseId);

        if (courseIndex === -1) {
            return next(createError(StatusCodes.NOT_FOUND, "Course not found"));
        }

        user.courses[courseIndex].dedication = dedication;
        await user.save();



        res.json(user);
    } catch (error) {
        console.error("Error:", error);
        next(error);
    }
};


// updateCourseProgress
module.exports.updateCourseProgress = async (req, res, next) => {

    try {
        const { courseId } = req.body;
        const { id } = req.params;
        const { currentPage } = req.body;

        const user = await User.findById(id);

        if (!user) {
            return next(createError(StatusCodes.NOT_FOUND, "User not found"));
        }

        const courseIndex = user.courses.findIndex(course => course.course._id.toString() === courseId);

        if (courseIndex === -1) {
            return next(createError(StatusCodes.NOT_FOUND, "Course not found"));
        }

        const course = await Course.findById(courseId);

        if (!course) {
            return next(createError(StatusCodes.NOT_FOUND, "Course not found"));
        }

        const courseLength = course.courseLength; // Longitud del curso obtenida del modelo del curso
        const courseProgressPercent = (currentPage / courseLength) * 100;

        // Actualizar el campo progress en el array courses
        user.courses[courseIndex].progress = {
            courseProgress: currentPage,
            courseProgressPercent,
            currentPage, // Actualizar la página actual
        };

        await user.save();


        res.json(user);
    } catch (error) {
        console.error("Error:", error);
        next(error);
    }
};

//Agregando o quitando cursos a la lista de cursos del usuario
module.exports.updateCourseStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { coursesId } = req.body;

        const user = await User.findById(id);

        if (!user) {
            return next(createError(StatusCodes.NOT_FOUND, "User not found"));
        }

        const updatedCourses = user.courses.filter(course => coursesId.includes(course.course.toString()));

        const newCourses = coursesId
            .filter(courseId => !user.courses.some(course => course.course.toString() === courseId))
            .map(courseId => ({ course: courseId }));

        user.courses = [...updatedCourses, ...newCourses];

        await user.save();

        res.status(StatusCodes.OK).json({ message: "User courses updated successfully", user });
    } catch (error) {
        next(error);
    }
};


module.exports.updateExamResults = (req, res) => {
    const { courseId, userId, examResults } = req.body;

    User.findById(userId)
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            const courseIndex = user.courses.findIndex(course => course.course.toString() === courseId);

            if (courseIndex === -1) {
                return res.status(404).json({ message: 'Curso no encontrado para este usuario' });
            }

            user.courses[courseIndex].examResults = examResults;
            user.courses[courseIndex].status = 'completed';
            return user.save();
        })
        .then(updatedUser => {
            res.status(200).json({ message: 'Resultados del examen actualizados exitosamente', user: updatedUser });
        })
        .catch(error => {
            console.error('Error al actualizar resultados del examen:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        });
};

//get data for the list of users. This data includes username, avatar, company, and courses

module.exports.getUserData = async (req, res, next) => {
    try {
        const users = await User.find()
            .populate("company")
            .select("username avatar company courses");
        res.json(users);
    } catch (error) {
        console.error("Error:", error);
        next(error);
    }
};

