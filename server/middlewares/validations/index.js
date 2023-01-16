import {body,validationResult} from 'express-validator';


function taskValidationRules () {
    return [
        body("taskname", "Taskname should not be empty and less than 50 characters").notEmpty().isLength({min:4, max: 50}),
        body("date").custom( (value) =>{
            if(new Date(value) == "Invalid Date") {
                throw Error("Invalid Deadline")
            }
            let backdated = value <= ((new Date() * 1) + (30 * 60 * 1000))
            let futureInvalidDate = value > ((new Date() * 1) + (30 * 24 * 60 * 60 * 1000))
            if(backdated || futureInvalidDate) {
                throw new Error ("Invalid time. Reminder date could not be in past. A valid reminder is 30 mins ahead or current time and less than 30 days");
            }
            return true;
        }),
        body("notification", "notification invalid input").isIn(['sms','email','both'])
    ]
}

function taskEditValidationRules() {
    let rules = taskValidationRules();
    return [
        ...rules,
        body("isCompleted", "Enter a value true or false").custom((value) => {
            if(!(value === true || value === false)) {
                throw new Error("invalid input, type true or false");
            }
            return true;
        })
    ]
}



function userRegisterValidationRules() {
    return [
        body ("firstname", "Firstname is required & min length 2 chars").notEmpty().isLength({ min : 2, max : 25 }),
        body("email","Email is Required").isEmail(),
        body("password","password should be min 8 atleast 1 num, 1 lower case , 1 upper case, and 1 number ")
        .isStrongPassword({minLength : 8, minUppercase : 1, minLowercase : 1, minNumbers : 1, minSymbols : 1}),
        body("confirmPassword").custom((value, {req}) => {
            if(value !== req.body.password) {
                throw new Error('Password did not match');
            }
            return true;
        }),
        body("phone","phone must be valid number").isMobilePhone()
    ]
}

function errorMiddleware(req,res,next) {

    const error = validationResult(req);
    if(!error.isEmpty()) {
        return res.status(400).json({error : error.array() });
    }
    next();
}

function userLoginValidation() {
    return [
        body("email", "Email is required").isEmail().notEmpty(),
        body("password","Password is required").notEmpty()
    ]
}

function userSuspendRules() {
    
}

export {
    userLoginValidation,
    userRegisterValidationRules,
    taskValidationRules,
    taskEditValidationRules,
    errorMiddleware
}