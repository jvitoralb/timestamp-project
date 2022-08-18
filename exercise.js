import mongoose from 'mongoose';
import User from './models/user.js';
import Exercise from './models/userExercise.js';


export const createUser = async (name) => {
    const newUser = new User({
        username: name
    });
    try {
        const savedUser = await newUser.save();
        return savedUser;
    } catch(err) {
        console.log(err);
    }
}

export const getAllUsers = async () => {
    try {
        const allUsers = await User.find({});
        return allUsers;
    } catch(err) {
        console.log(err);
    }
}

const updateUser = async (user, update) => {
    try {
        const userUpdate = await User.findByIdAndUpdate(user, update);
        return userUpdate;
    } catch(err) {
        console.log(err);
    }
}

export const createExercise = async (id, desc, dur, date) => {

    const newExercise = new Exercise({
        _id: new mongoose.Types.ObjectId,
        user: id,
        desc: desc,
        dur: dur,
        date: date
    });

    try {
        const savedExercise = await newExercise.save();
        const userExercise = await updateUser(savedExercise.user._id, {
            description: savedExercise.desc,
            duration: savedExercise.dur,
            date: savedExercise.date
        });
        return userExercise;
    } catch(err) {
        console.log(err);
    }
}

export const getUserLogs = async (usernameID) => {
    const dataFound = await Exercise.find({username: usernameID});
    let logs = dataFound.map(log => ({
            description: log.description,
            duration: log.duration,
            date: log.date
        })
    );
    let user = await dataFound[0].populate('username');
    return {
        _id: user.username._id,
        username: user.username.username,
        count: dataFound.length,
        log: logs,
    }
}