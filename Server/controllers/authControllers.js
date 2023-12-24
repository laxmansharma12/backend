import { comparePassword, hashPassword } from "../helper/authHelper.js";
import userModel from "../Models/User.js";
import JWT from "jsonwebtoken";
export const registerController = async (req, res) => {
	try {
		const { name, email, password, answer } = req.body;
		//validation
		if (!name) {
			return res.send({ message: "Name is required" });
		}
		if (!email) {
			return res.send({ message: "Email is required" });
		}
		if (!password) {
			return res.send({ message: "Password is required" });
		}
		if (!answer) {
			return res.send({ message: "Answer is required" });
		}

		//check user
		const existingUser = await userModel.findOne({ email });

		//existingUser user
		if (existingUser) {
			return res.status(200).send({
				success: false,
				message: "Already Registered Please Sign-up Again!",
			});
		}

		//register user
		const hashedPassword = await hashPassword(password);

		//save
		const user = await new userModel({
			name,
			email,
			answer,
			password: hashedPassword,
		}).save();
		res.status(201).send({
			success: true,
			message: "User Signed Successfully!",
			user,
		});
	} catch (error) {
		console.log(error);
		res.status(500).send({
			success: false,
			message: "Error in sign-up",
		});
	}
};

//POST LOGIN
export const loginController = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email) {
			return res.send({ message: "Email is required" });
		}
		if (!password) {
			return res.send({ message: "Password is required" });
		}
		//check user
		const user = await userModel.findOne({ email });
		if (!user) {
			return res.status(200).send({
				success: false,
				message: "User is not registered!",
			});
		}
		const match = await comparePassword(password, user.password);
		if (!match) {
			return res.status(200).send({
				success: false,
				message: "Invalid Password",
			});
		}

		//TOKEN
		const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
			expiresIn: "7d",
		});
		res.status(200).send({
			success: true,
			message: "Login Successfully!",
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
			token,
		});
	} catch (error) {
		console.log(error);
		res.status(500).send({
			success: false,
			message: "Error in login",
			error,
		});
	}
};
