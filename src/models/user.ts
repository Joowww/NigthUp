import mongoose, { Schema, model, Types } from 'mongoose';
import bcrypt from 'bcryptjs';


export const DEFAULT_AVATAR = '/default-images/default-avatar.png';
export const DEFAULT_COVER_PHOTO = '/default-images/default-cover.jpg';


export interface IUser {
    _id: Types.ObjectId;
    username: string;
    email: string;
    password: string;
    birthday: Date;
    phoneNumber: string;
    events: Types.ObjectId[];
    active: boolean;
    role: string;
    googleId?: string;
    googleProfile?: {
        name?: string;
        picture?: string;
        locale?: string;
    };
    authProvider: 'local' | 'google';
    securityQuestion?: string;
    securityAnswer?: string;
    isOnline: boolean;
    lastSeen: Date;
    emergencyContacts: string[];
    location?: {
        type: string;
        coordinates: [number, number];
    };
    isVisibleOnMap: boolean;
    lastLocationUpdate?: Date;
    avatar: string;  
    coverPhoto: string; 
    bio?: string;
    posts?: Types.ObjectId[];
    interests: Types.ObjectId[]; 
    friends: Types.ObjectId[];   
    firstName?: string;
    lastName?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    city?: string;
    country?: string;
    website?: string;
    socialMedia?: {
        instagram?: string;
        twitter?: string;
        facebook?: string;
        tiktok?: string;
    };

    comparePassword(candidatePassword: string): Promise<boolean>;
    compareSecurityAnswer(candidateAnswer: string): Promise<boolean>;
    isModified(path: string): boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export const SECURITY_QUESTION_KEYS = [
    "security.question.pet_name",
    "security.question.birth_city",
    "security.question.mother_maiden_name",
    "security.question.first_school",
    "security.question.favorite_food",
    "security.question.childhood_street",
    "security.question.best_friend",
    "security.question.first_job",
    "security.question.favorite_book",
    "security.question.birth_hospital",
    "security.question.father_middle_name",
    "security.question.first_car",
    "security.question.favorite_teacher",
    "security.question.graduation_year",
    "security.question.favorite_movie"
];

export const SECURITY_QUESTIONS_FALLBACK = {
    "security.question.pet_name": "¿Cuál es el nombre de tu primera mascota?",
    "security.question.birth_city": "¿En qué ciudad naciste?",
    "security.question.mother_maiden_name": "¿Cuál es el nombre de soltera de tu madre?",
    "security.question.first_school": "¿Cuál fue el nombre de tu primera escuela?",
    "security.question.favorite_food": "¿Cuál es tu comida favorita?",
    "security.question.childhood_street": "¿En qué calle vivías cuando eras niño?",
    "security.question.best_friend": "¿Cuál es el nombre de tu mejor amigo de la infancia?",
    "security.question.first_job": "¿Cuál fue tu primer trabajo?",
    "security.question.favorite_book": "¿Cuál es el nombre de tu libro favorito?",
    "security.question.birth_hospital": "¿En qué hospital naciste?",
    "security.question.father_middle_name": "¿Cuál es el segundo nombre de tu padre?",
    "security.question.first_car": "¿Cuál fue el modelo de tu primer coche?",
    "security.question.favorite_teacher": "¿Cuál es el nombre de tu profesor favorito?",
    "security.question.graduation_year": "¿En qué año te graduaste de la secundaria?",
    "security.question.favorite_movie": "¿Cuál es el nombre de tu película favorita?"
};

const userSchema = new Schema<IUser>({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    birthday: { type: Date, required: true },
    phoneNumber: {
        type: String,
        required: false,
        validate: {
            validator: function(v: string) {
                if (!v) return true;
                return /^[\+]?[(]?[\d\s\-\(\)]{10,}$/.test(v);
            },
            message: 'Phone number format is invalid'
        },
        default: null
    },
    events: [{ type: Schema.Types.ObjectId, ref: 'Event', default: [] }],
    active: { type: Boolean, default: true },
    role: { type: String, required: true, enum: ['admin', 'manager', 'user'], default: 'user' },
    avatar: { 
        type: String, 
        default: DEFAULT_AVATAR 
    },
    coverPhoto: { 
        type: String, 
        default: DEFAULT_COVER_PHOTO 
    },
    googleId: { type: String, sparse: true },
    googleProfile: {
        name: String,
        picture: String,
        locale: String
    },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    securityQuestion: { type: String, enum: SECURITY_QUESTION_KEYS },
    securityAnswer: { type: String },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    emergencyContacts: [{ type: String, default: [] }],
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }
    },
    isVisibleOnMap: { type: Boolean, default: true },
    lastLocationUpdate: { type: Date },
    bio: {
        type: String,
        maxlength: 500,
        default: ''
    },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post',
        default: []
    }],
    interests: [{
        type: Schema.Types.ObjectId,
        ref: 'Tag',
        default: []
    }],
    friends: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }],
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer_not_to_say'],
        default: 'prefer_not_to_say'
    },
    city: { type: String, default: '' },
    country: { type: String, default: '' },
    website: { type: String, default: '' },
    socialMedia: {
        instagram: { type: String, default: '' },
        twitter: { type: String, default: '' },
        facebook: { type: String, default: '' },
        tiktok: { type: String, default: '' }
    }
}, {
    timestamps: true,
    versionKey: false
});

userSchema.index({ location: '2dsphere' });

userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password') && !this.isModified('securityAnswer')) return next();

    if (this.isModified('password')) {
        console.log('Hasheando contraseña...');
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(this.password, salt);
        this.password = hash;
    }

    if (this.isModified('securityAnswer') && this.securityAnswer) {
        console.log('Hasheando respuesta de seguridad...');
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(this.securityAnswer.toLowerCase().trim(), salt);
        this.securityAnswer = hash;
    }

    next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.compareSecurityAnswer = async function (candidateAnswer: string): Promise<boolean> {
    if (!this.securityAnswer) return false;
    return await bcrypt.compare(candidateAnswer.toLowerCase().trim(), this.securityAnswer);
};

export const User = model<IUser>('User', userSchema);
export default User;