
const Company = require('../models/Company.model');
const User = require('../models/User.model');
const createError = require("http-errors");
const { StatusCodes } = require("http-status-codes");

module.exports.getAll = (req, res, next) => {
    Company.find()
    .populate('users')
    .populate('courses')
        .then(companys => {
            res.status(StatusCodes.OK).json(companys);
        })
        .catch((err) => {
            console.log(err);
            next(createError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error"));
        });
}

module.exports.getIds = (req, res, next) => {
    //getting name and Ids
    Company.find()
        .select('name')
        .then(companys => {
            res.status(StatusCodes.OK).json(companys);
        })
        .catch((err) => {
            console.log(err);
            next(createError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error"));
        });
}

module.exports.create = (req, res, next) => {
    if(req.file){
        req.body.logo = req.file.path;
    }
    const company = new Company(req.body);
    company.save()
        .then(company => {
            res.status(StatusCodes.CREATED).json(company);
        })
        .catch((err) => {
            console.log(err);
            next(createError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error"));
        });
}

module.exports.getOne = (req, res, next) => {
    Company.findById(req.params.id)
    .populate('users')
    .populate('courses')
      .then((company) => {
        if (!company) {
          next(createError(StatusCodes.NOT_FOUND, "Company not found"));
        } else {
          res.status(StatusCodes.OK).json(company);
        }
      })
      .catch((err) => {
        console.log(err);
        next(createError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error"));
    });
}

module.exports.update = (req, res, next) => {
    if(req.file){
        req.body.logo = req.file.path;
    }
    const id = req.params.id;
    const company = req.body;

    Company.findByIdAndUpdate(id, company, { new: true })
        .then(company => {
            if(!company){
                next(createError(StatusCodes.NOT_FOUND, "Company not found"));
            } else {
                res.status(StatusCodes.OK).json(company);
            }
        })
        .catch((err) => {
            console.log(err);
            next(createError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error"));
        });
}

module.exports.delete = (req, res, next) => {
    Company.findByIdAndDelete(req.params.id)
        .then((company) => {
            if (!company) {
                next(createError(StatusCodes.NOT_FOUND, "Company not found"));
            } else {
                res.status(StatusCodes.OK).json(company);
            }
        })
        .catch((err) => {
            console.log(err);
            next(createError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error"));
        });
}

//controlador para obtener la el nombre de la compañía, el id, el id de los usuarios y el id de los cursos


module.exports.getCompanyIdsData = (req, res, next) => {
    Company.findById(req.params.id)
        .select('name users courses')
        .populate({
            path: 'users',
            select: '_id username email'
        })
        .populate({
            path: 'courses',
            select: '_id name description'
        })
        .then(company => {
            if (!company) {
                return next(createError(StatusCodes.NOT_FOUND, "Company not found"));
            }

            // Formatear los datos para cumplir con los requerimientos del frontend
            const formattedCompany = {
                name: company.name,
                users: company.users.map(user => ({
                    id: user._id,
                    username: user.username,
                    email: user.email,
                })),
                courses: company.courses.map(course => ({
                    id: course._id,
                    name: course.name,
                    description: course.description,
                }))
            };

            res.status(StatusCodes.OK).json(formattedCompany);
        })
        .catch((err) => {
            console.error(err);
            next(createError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error"));
        });
};
