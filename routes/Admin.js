import { Router } from "express";


import { login, dashboard, loginPost ,studentlist,studentadd,studentdetails,studentedit,
    perfomanceadd,perfomanceedit,saveStudent,performanceList,savePerformance,updatestudent,deletestudent
,deleteperformance,updatePerformance} from "../controller/Admin.js";

const router = Router();

router.get("/", login);
router.post("/login", loginPost); // Add POST route
router.get("/dashboard", dashboard);
router.get("/studentlist",studentlist);
router.get("/studentadd",studentadd);
// router.get("/studentdetails",studentdetails);
router.get("/studentdetails/:id", studentdetails);

router.get("/studentedit/:id", studentedit);
router.put("/updatestudent", updatestudent);
// router.delete("/deletestudent/:id", deletestudent);

router.get("/deletestudent/:id", deletestudent);


router.get("/perfromanceadd",perfomanceadd);
router.get("/performancedit/:id", perfomanceedit);
router.get("/deleteperformance/:id", deleteperformance);

// router.get("/performancedit/:id", perfomanceedit);

router.get("/performancelist",performanceList);

router.post("/saveperformance", savePerformance);

// In your routes file
router.put("/updateperformance", updatePerformance); // For JSON requests
router.post("/update-performance/:id", updatePerformance); // For form submissions




router.post("/savestudent",saveStudent)
export default router;
