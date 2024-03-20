import validator from 'validator';

const validateSchedulePresentation = (data) => {
    let errors = {};
    const{
        ScheduleID,
        GroupID,
        date,
        timeDuration,
        location,
        topic,
        examiners
       }

    if(validator.isEmpty(ScheduleID)){
        errors.ScheduleID = "ScheduleID is required";
    }else if(validator.isInt(ScheduleID)){
        errors.ScheduleID = "ScheduleID should not be integer";
    }else {
        const scheduleIDPattern = /^SP[0-9]+$/;
        if(scheduleIDPattern.test(ScheduleID) == false){
            errors.ScheduleID = "ScheduleID should be in the format SPXXXX";
        }
    }

    if(validator.isEmpty(GroupID)){
        errors.GroupID = "GroupID is required";
    }
    
    if(validator.isEmpty(date)){
        errors.date = "Date is required";
    }

    if(validator.isEmpty(timeDuration)){
        errors.timeDuration = "Time Duration is required";
    }else if (timeDuration === undefined) {
        errors.timeDuration = 'Please enter correct time duration';
    }else {
        const pattern = /^(0?[1-9]|1[0-2]):([0-5][0-9])\s(?:AM|PM)\s-\s(0?[1-9]|1[0-2]):([0-5][0-9])\s(?:AM|PM)$/;
        if (pattern.test(timeDuration) === false) {
            errors.timeDuration = 'Please provide a valid time duration (e.g., 08:30 AM - 09:00 AM';
        }
    }
    
    
};

export default validateSchedulePresentation;