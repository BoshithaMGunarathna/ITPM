import StudentRegModel from "../../models/studentModels/studentRegModel.js";
import jwt from 'jsonwebtoken';
import { sendEmail } from "../../utils/sendEmail.js";

//PASS EMAIL ADDRESS HERE AND THIS WILL GENERATE A JWT TOKEN
// const createToken = (email) => {
//     return jwt.sign({ email }, process.env.SECRET_KEY,);
// }

// export const verifyToken = (token) => {
//     return jwt.verify(token, process.env.SECRET_KEY);
// }

// LOGIN FUNCTION: This will send the token and userRole
// export const Login = async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const isExist = await StudentRegModel.findOne({ email });
//         if (!isExist) {
//             throw Error('Email Not Exist !!');
//         }

//         // To Do: After implementing User Create part, enable this method
//         if(! await isExist.isPasswordMatched(password)){
//             throw Error('Password Incorrect !!');
//         }
//         // if (isExist.password !== password) {
//         //     throw Error('Password Incorrect !!');
//         // }
//         const id = isExist._id.toString();
//         const token = createToken(id);
        
//         res.status(200).json({
//             token,
//             userRole: isExist.role,
//             firstName: isExist.firstName
//         })
//     } catch (error) {
//         //console.log(error);
//         res.status(401).json({ message: error.message });
//     }

// }

// USER ACCOUNT CREATION
// export const CreateStudent = async (req, res) => {
//     const data = req.body;
//     try {
//         const isExist = await StudentRegModel.findOne({ email: data.email });
//         if (isExist) {
//             throw Error('Email Already Exist !!');
//         }

//         const result = await StudentRegModel.create(data);
//         console.log(result);
        
//         sendEmail(data.email, "Student Account Created Successfully", { name: `${data.firstName}`, email: `Email : ${data.email}`, description: `Password: ${data.password}`, }, "./template/emailtemplate.handlebars");
//         res.status(200).json({
//             message: 'Account Created Successfully!'
//         })
//     } catch (error) {
//         console.log(error);
//         res.status(401).json({ message: error.message });
//     }

// }



// Create new Student Account
export const CreateStudent = async (req, res) => {
    const {
        studentID,
        firstName,
        lastName,
        contactNo,
        email,
        password,
        specialization,
        semester
    } = req.body;

    const result = await StudentRegModel.find();
    const studentCount = result.length;

    // generate new Group ID for the new Groups
    const newStudentID = `IT${studentCount + 1}`;

    const mongooseRes = new StudentRegModel({
       
        studentID: newStudentID,
        firstName,
        lastName,
        contactNo,
        email,
        password,
        specialization,
        semester
    });

    console.log(mongooseRes);
    mongooseRes.save().then((result) => {
        res.status(200).json({
            message: "New Student Account created successfully!",
            result: {
                data: result,
                response: true,
            },
        });
    }).catch((err) => {
        res.status(500).json({
            message: "Error while creating new Student Account!",
            error: err,
        });
    });
};

// //GET USER DETAILS
// export const getUserDetails = async(req,res)=>{
//     const id = req.loggedInId
//     console.log('API INSIDE :' , id);
//     try {
//         const isExist = await StudentRegModel.findById(id);
//         if(!isExist){
//             res.status(401).json({message:'User Not Exist'});
//         }
//         res.status(200).json(isExist);
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({message:error.message});
//     }
// }

// export const sendNewEmail = async (req,res)=>{
//     try{
//         const data = req.body
//         if(!data.sendTo || !data.description || !data.subject){
//             throw Error ('All fields must be fillded..')
//         }
//         await sendEmail(data.sendTo, data.subject, { name: ``, description: data.description }, "./template/emailtemplate.handlebars");
//         res.status(200).json({
//             message: 'Email Sent successfully!'
//         });
//     }catch(error) {
//         console.log();
//         res.status(500).json({message:error.message});
//     }
// }

// export const deleteAccount = async (req, res) => {
//     try {
//         const id = req.params.id;

//         if (!id) {
//             throw Error("Id can't be empty");
//         }

//         const deletedAccount = await StudentRegModel.findByIdAndDelete(id);
//         res.status(200).json({ message: 'Account Deleted Successfully', subject:deletedAccount });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// }

// export const updateAccount = async (req, res) => {
//     try {
//         const id = req.params.id;
//         const Data = req.body;

//         if (!id) {
//             throw Error("Id can't be empty");
//         }

//         const updatedAccount = await StudentRegModel.findByIdAndUpdate( id, Data );
//         res.status(200).json({ message: 'Account Updated Successfully', subject: updatedAccount });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// }