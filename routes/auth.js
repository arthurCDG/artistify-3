const express = require("express");
const authRouter = express.Router();
const UserModel = require("../model/User");
const bcrypt = require("bcrypt"); // lib to encrypt data

authRouter.get('/signin', (req, res, next) => {
    res.render("auth/signin.hbs")
})

authRouter.get('/signup', (req, res, next) => {
    res.render("auth/signup.hbs");
})

authRouter.get("/signout", (req, res, next) => {
    req.session.destroy((err) => res.redirect("/auth/signin")
    )
})

authRouter.post('/signin', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const foundUser = await UserModel.findOne({ email: email });
        if (!foundUser) {
            req.flash("error", "Invalid credentials");
            res.redirect("/auth/signin");
        }
        else {
            const isSamePassword = bcrypt.compareSync(password, foundUser.password);
            if (!isSamePassword) {
                req.flash("error", "Invalid credentials");
                res.redirect("/auth/signin");
            }
            else {
                const userObject = foundUser.toObject();
                delete userObject.password;
                req.session.currentUser = userObject;
                req.flash("success", "Successfully logged in...");
                res.redirect("/profile");
            }
        }
    }
    catch (err) {
            next(err);
        }

    })

authRouter.post('/signup', async (req, res, next) => {
    try {
        const newUser = { ...req.body };
        const foundUser = await UserModel.findOne({ email: newUser.email });
        if (foundUser) {
            req.flash("warning", "Email already registered");
            res.redirect("/auth/signup");
        }
        else {
            const hashedPassword = bcrypt.hashSync(newUser.password, 10);
            newUser.password = hashedPassword;
            await UserModel.create(newUser);
            req.flash("success", "Congrats ! You are now registered !");
            res.redirect("/auth/signin");
        }
    }

    catch (err) {
        let errorMessage = "";
        console.log(err);
        for (field in err.errors) {
            errorMessage += err.errors[field].message + "\n";
        }
        req.flash("error", errorMessage);
        res.redirect("/auth/signup");
    }
    // next(err)
    // }
})


module.exports = authRouter;