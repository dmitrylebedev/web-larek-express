import bcrypt from 'bcryptjs';
import mongoose, { Schema } from 'mongoose';
import validator from 'validator';

interface IToken {
  token: string;
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  tokens: IToken[];
}

const tokenSchema = new Schema<IToken>({
  token: {
    type: String,
    required: true,
  },
}, { _id: false });

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    minlength: [2, 'Минимальная длина поля "name" - 2'],
    maxlength: [30, 'Максимальная длина поля "name" - 30'],
    default: 'Ё-мое',
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Поле "email" должно быть заполнено'],
    validate: {
      validator: (email: string) => validator.isEmail(email),
      message: 'Поле "email" должно быть валидным адресом',
    },
  },
  password: {
    type: String,
    required: [true, 'Поле "password" должно быть заполнено'],
    minlength: [6, 'Минимальная длина поля "password" - 6'],
    select: false,
  },
  tokens: {
    type: [tokenSchema],
    default: [],
    select: false,
  },
}, { versionKey: false });

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

export default mongoose.model<IUser>('user', userSchema);
