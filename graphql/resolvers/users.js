import bcrypt from 'bcryptjs/dist/bcrypt';
import jwt from 'jsonwebtoken';
import { UserInputError } from 'apollo-server';

import { validateRegisterInput, validateLoginInput } from '../../utils/validators';
import { SECRET_KEY } from '../../config';
import User from '../../models/User';

function generateToken(user) {
    return jwt.sign({
        id: user.id, email: user.email, username: user.username
    },
        SECRET_KEY,
        { expiresIn: '1h' });
}

export const Mutation = {
    async login(_, { username, password }) {
        const { errors, valid } = validateLoginInput(username, password);

        if (!valid) {
            throw new UserInputError('Errors', { errors });
        }

        const user = await User.findOne({ username });

        if (!user) {
            errors.general = 'User Not Found';
            throw new UserInputError('User Not Found', { errors });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            errors.general = 'Wrong Credentials';
            throw new UserInputError('Wrong Credentials', { errors });
        }

        const token = generateToken(user);

        return {
            ...user._doc,
            id: user._id,
            token
        };
    },
    async register(_, { registerInput: { username, email, password, confirmPassword } },) {
        // Validate User Data
        const { valid, errors } = validateRegisterInput(username, email, password, confirmPassword);
        if (!valid) {
            throw new UserInputError('Errors', { errors });
        }
        // Make sure user doesnt already exists.
        const user = await User.findOne({ username });
        if (user) {
            throw new UserInputError('username is taken', {
                errors: {
                    username: 'This username is taken'
                }
            });
        }

        // hash password and create an auth token
        password = await hash(password, 12);

        const newUser = new User({ email, username, password, createdAt: new Date().toISOString });

        const res = await newUser.save();

        const token = generateToken(res);

        return {
            ...res._doc,
            id: res._id,
            token
        };
    },
};