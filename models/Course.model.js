//modelo de cursos

const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Debe ingresar un nombre'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        default: 'Aún no se ha ingresado una descripción',
        trim: true
    },
    mainImage: {
        type: String,
        trim: true,
        default: 'https://res.cloudinary.com/dv7hswrot/image/upload/v1606988059/avatar/avatar_cugq40.png'
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    instructions:{
        type: String,
        trim: true
    },
    content: [{
        title: {
            type: String,
            trim: true
        },
        description: {
            type: String,

            trim: true
        },
        image: {
            type: String,
            trim: true
        }
    }],
    courseLength: {
        type: Number,
        default: 0
    },
    tests: [{
        title: {
            type: String,
            trim: true,
            required: [true, 'Debe ingresar un título']
        },
        questions: [{
            question: {
                type: String,
                trim: true,
                required: [true, 'Debe ingresar una pregunta']
            },
            options: [{
                option: {
                    type: String,
                    trim: true,
                    required: [true, 'Debe ingresar al menos una opción']
                },
                isCorrect: {
                    type: Boolean,
                    default: false,
                    required: [true, 'Debe ingresar una respuesta correcta']
                }
            }]
        }]
    }],
    Exam: {
        title: {
            type: String,
            trim: true
        },
        questions: [{
            question: {
                type: String,
                trim: true,
                reqquired: [true, 'Debe ingresar una pregunta']
            },
            options: [{
                option: {
                    type: String,
                    trim: true,
                    required: [true, 'Debe ingresar al menos una opción']
                },
                isCorrect: {
                    type: Boolean,
                    default: false,
                    required: [true, 'Debe ingresar una respuesta correcta']
                }
            }]
        }]
    },

}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            ret.id = doc._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

courseSchema.pre('save', function(next) {
    this.courseLength = this.content.length + this.tests.length + 1;

    // Validar y actualizar el campo image en cada objeto dentro del array content
    this.content = this.content.map(item => {
        if (!item.image || item.image.trim() === "") {
            item.image = "undefined";
        }
        return item;
    });

    next();
});


const Course = mongoose.model('Course', courseSchema);

module.exports = Course;