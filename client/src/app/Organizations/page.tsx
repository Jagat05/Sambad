// import connectDB from "";
// import Organization from "@/models/organization";
// import { getUserFromToken } from "@/utils/auth"; // your token utility

// export default async function handler(req, res) {
//   await connectDB();

//   if (req.method === "POST") {
//     try {
//       const user = await getUserFromToken(req); // validate JWT
//       const { name } = req.body;

//       const organization = await Organization.create({
//         name,
//         createdBy: user._id,
//         members: [{ user: user._id, role: "admin" }],
//       });

//       res.status(201).json({
//         id: organization._id,
//         name: organization.name,
//         avatar: name.charAt(0).toUpperCase(),
//         memberCount: organization.members.length,
//         role: "Admin",
//       });
//     } catch (error) {
//       res.status(400).json({ message: error.message });
//     }
//   }

//   if (req.method === "GET") {
//     try {
//       const user = await getUserFromToken(req);

//       const orgs = await Organization.find({ "members.user": user._id }).populate("members.user");

//       const result = orgs.map((org) => {
//         const userRole = org.members.find((m) => m.user._id.toString() === user._id.toString())?.role;
//         return {
//           id: org._id,
//           name: org.name,
//           avatar: org.name.charAt(0).toUpperCase(),
//           memberCount: org.members.length,
//           role: userRole || "Member",
//         };
//       });

//       res.status(200).json(result);
//     } catch (error) {
//       res.status(500).json({ message: error.
//        });
//     }
//   }
// }
