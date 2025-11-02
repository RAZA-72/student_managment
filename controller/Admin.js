// Predefined static credentials
const STATIC_USERNAME = "admin";
const STATIC_PASSWORD = "admin123";
import sequelize from "../config/db.js";
import Student from "../models/StudentModel.js"; 

import Performance from "../models/PerformanceModel.js"

export const login = async (req, res) => {
  try {
    res.status(200).render("login");
  } catch (error) {
    res.status(500).json({ message: "Internal server error in login page" });
  }
};

export const loginPost = async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("Login attempt:", { username, password });

    // Check if credentials match our static values
    if (username === STATIC_USERNAME && password === STATIC_PASSWORD) {
      res.status(200).json({
        success: true,
        message: "Login successful",
        redirect: "/dashboard"
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid username or password"
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during login"
    });
  }
};



export const dashboard = async (req, res) => {
  try {
    // Get total unique students count
    const totalStudents = await Student.count();
    
    // Get overall performance statistics
    const performanceStats = await Performance.findAll({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('total_score')), 'avg_total_score'],
        [sequelize.fn('MAX', sequelize.col('total_score')), 'max_total_score'],
        [sequelize.fn('MIN', sequelize.col('total_score')), 'min_total_score'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_records']
      ],
      raw: true
    });

    // Get top 5 students based on total_score
    const topStudents = await Performance.findAll({
      include: [{
        model: Student,
        attributes: ['student_id', 'name', 'course']
      }],
      order: [['total_score', 'DESC']],
      limit: 5,
      attributes: ['total_score', 'percentage', 'grade', 'semester', 'academic_year']
    });

    // Get grade distribution
    const gradeDistribution = await Performance.findAll({
      attributes: [
        'grade',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['grade'],
      raw: true
    });

    // Get performance by category
    const categoryStats = await Performance.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('AVG', sequelize.col('total_score')), 'avg_score']
      ],
      group: ['category'],
      raw: true
    });

    res.status(200).render("dashboard", {
      totalStudents,
      performanceStats: performanceStats[0],
      topStudents,
      gradeDistribution,
      categoryStats
    });
    
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Internal server error in dashboard page" });
  }
};


export const studentlist = async (req, res) => {
  try {
    const students = await Student.findAll(); // DB se data le lo
    res.render("students/studentlist", {
      title: "Student List",
      students, // data ko view me bhej diya
    });
  } catch (error) {
    console.error("Error loading student list:", error);
    res.status(500).send("Internal Server Error");
  }
};




export const studentadd = async (req, res) => {

  try {
    res.status(200).render("students/studentadd", {
      title: "Student List",
    });
  } catch (error) {
    console.error(" Error rendering student add:", error);
    res.status(500).json({
      message: "Internal server error in the studentadd route",
      error: error.message
    });
  }
}


export const studentdetails = async (req, res) => {
  try {
    const { id } = req.params; // e.g. /studentdetails/:id

    // Fetch the student
    const student = await Student.findOne({ where: { sr_id: id } });

    if (!student) {
      return res.status(404).render("students/studentdetails", {
        title: "Student Details",
        student: null,
        performances: [],
      });
    }

    // Fetch all performances for this student
    const performances = await Performance.findAll({
      where: { student_id: student.sr_id },
      order: [["id", "DESC"]], // optional: show latest first
    });

    res.render("students/studentdetails", {
      title: "Student Details",
      student,
      performances,
    });
  } catch (error) {
    console.error("Error rendering student details:", error);
    res.status(500).send("Internal server error");
  }
};


export const studentedit = async (req, res) => {
  try {
    const sr_id = req.params.id; // ✅ match the route name

    if (!sr_id) {
      return res.status(400).json({ message: "Student SR ID is required" });
    }

    // Fetch using sr_id instead of _id
    const student = await Student.findOne({ sr_id });

    if (!student) {
      return res.status(404).render("error", { message: "Student not found" });
    }

    res.status(200).render("students/studentedit", {
      title: "Edit Student",
      student,
    });
  } catch (error) {
    console.error("❌ Error rendering student edit:", error);
    res.status(500).json({
      message: "Internal server error in studentedit route",
      error: error.message,
    });
  }
};

export const updatestudent = async (req, res) => {
  try {
    const { id, name, email, phone, address, course, semester } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Student ID missing" });
    }

    const student = await Student.findOne({ where: { sr_id: id } });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    await student.update({ name, email, phone, address, course, semester });

    res.json({ success: true, message: "Student updated successfully" });
  } catch (err) {
    console.error("❌ Update error:", err);
    res.status(500).json({ success: false, message: "Error updating student" });
  }
};


export const deletestudent = async (req, res) => {
  try {
    const sr_id = req.params.id;

    const deleted = await Student.destroy({ where: { sr_id } });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Redirect to the list page after successful delete
    res.redirect("/studentlist");
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ success: false, message: "Error deleting student" });
  }
};



export const perfomanceadd = async (req, res) => {
  try {
    const students = await Student.findAll({
      attributes: ["sr_id", "Student_id", "name"],
      order: [["name", "ASC"]],
    });

    res.render("perfromance/performanceadd", {
      title: "Add Performance",
      students, // send students list to view
    });
  } catch (error) {
    console.error("Error rendering performance form:", error);
    res.status(500).send("Server error");
  }
};


export const perfomanceedit = async (req, res) => {
  try {
    const id = req.params.id; // /performancedit/3

    if (!id) {
      return res.status(400).json({ message: "Performance ID is required" });
    }

    // Fetch the performance record by ID
    const performance = await Performance.findByPk(id);

    if (!performance) {
      return res.status(404).json({ message: "Performance record not found" });
    }

    // Fetch all students for dropdown
    const students = await Student.findAll({
      attributes: ["sr_id", "Student_id", "name", "course"],
      order: [["name", "ASC"]],
    });

    // Render the correct edit page
    res.render("perfromance/performanceedit", {
      title: "Edit Performance",
      performance: performance.dataValues,
      students: students.map((s) => s.dataValues),
    });
  } catch (error) {
    console.error("❌ Error rendering performance edit:", error);
    res.status(500).json({
      message: "Internal server error in performance edit route",
      error: error.message,
    });
  }
};


export const deleteperformance = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ success: false, message: "Performance ID is required" });
    }

    const deleted = await Performance.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Performance record not found" });
    }

    // ✅ Redirect to performance list after delete
    res.redirect("/performancelist");
  } catch (error) {
    console.error("❌ Error deleting performance:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while deleting performance",
      error: error.message,
    });
  }
};


// ✅ Create new student
export const saveStudent = async (req, res) => {
  try {
    const { student_id, name, email, phone, address, course, semester } = req.body;

    // Validation
    if (!student_id || !name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, Name and Email are required',
      });
    }

    // Create new student
    const newStudent = await Student.create({
      Student_id: student_id, // custom ID
      name,
      email,
      phone: phone || null,
      address: address || null,
      course: course || null,
      semester: semester || null,
    });

    res.status(201).json({
      success: true,
      message: 'Student added successfully!',
      data: {
        student_id: newStudent.Student_id,
        name: newStudent.name,
        email: newStudent.email,
      },
    });
  } catch (error) {
    console.error('Error saving student:', error);

    let errorMessage = 'Failed to save student';
    if (error.name === 'SequelizeUniqueConstraintError') {
      errorMessage = 'Student ID or Email already exists';
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
};




export const performanceList = async (req, res) => {
  try {
    const performances = await Performance.findAll({
      include: {
        model: Student,
        attributes: ["name", "Student_id", "course"],
      },
      order: [["id", "DESC"]],
    });

    res.render("perfromance/performancelist", {
      title: "Student Performance List",
      performances,
    });
  } catch (error) {
    console.error("Error loading performances:", error);
    res.status(500).send("Internal Server Error");
  }
};

// controller/Admin.js

export const savePerformance = async (req, res) => {
  try {
    const {
      student_id,
      semester, // Make sure this is included
      academic_year,
      behaviour_discipline,
      academic_performance,
      extracurricular_participation,
      punctuality,
      remarks
    } = req.body;

    console.log("Received data:", req.body);

    // Calculate total, percentage, grade, category
    const total = (
      parseFloat(behaviour_discipline) +
      parseFloat(academic_performance) +
      parseFloat(extracurricular_participation) +
      parseFloat(punctuality)
    );
    const percentage = (total / 40) * 100;

    let grade, category;
    if (percentage >= 90) { grade = 'A+'; category = 'Outstanding'; }
    else if (percentage >= 80) { grade = 'A'; category = 'Bright'; }
    else if (percentage >= 70) { grade = 'B+'; category = 'Good'; }
    else if (percentage >= 60) { grade = 'B'; category = 'Good'; }
    else if (percentage >= 50) { grade = 'C'; category = 'Average'; }
    else if (percentage >= 40) { grade = 'D'; category = 'Average'; }
    else { grade = 'F'; category = 'Defaulter'; }

    const performanceData = {
      student_id,
      semester: semester || 'Annual', // Provide default value
      academic_year,
      behaviour_discipline,
      academic_performance,
      extracurricular_participation,
      punctuality,
      total_score: total,
      percentage,
      grade,
      category,
      remarks
    };

    console.log("Performance data to save:", performanceData);

    await Performance.create(performanceData);

    res.redirect("/performancelist");
  } catch (error) {
    console.error("Detailed error saving performance:", error);
    res.status(500).send("Error saving performance data. Check server logs for details.");
  }
};








// Update Performance - POST
export const updatePerformance = async (req, res) => {
  try {
    const { 
      id,
      student_id,
      semester,
      academic_year,
      behaviour_discipline,
      academic_performance,
      extracurricular_participation,
      punctuality,
      remarks
    } = req.body;

    console.log("Update data:", req.body);
    console.log("Performance ID:", id);

    // Validate required fields (removed semester from required)
    if (!id) {
      return res.json({ 
        success: false, 
        message: "Performance ID is required for update." 
      });
    }

    if (!student_id || !academic_year) {
      return res.json({ 
        success: false, 
        message: "Student ID and Academic Year are required." 
      });
    }

    // Calculate total, percentage, grade, category
    const total = (
      parseFloat(behaviour_discipline) +
      parseFloat(academic_performance) +
      parseFloat(extracurricular_participation) +
      parseFloat(punctuality)
    );
    const percentage = (total / 40) * 100;

    let grade, category;
    if (percentage >= 90) { 
      grade = 'A+'; 
      category = 'Outstanding'; 
    }
    else if (percentage >= 80) { 
      grade = 'A'; 
      category = 'Bright'; 
    }
    else if (percentage >= 70) { 
      grade = 'B+'; 
      category = 'Good'; 
    }
    else if (percentage >= 60) { 
      grade = 'B'; 
      category = 'Good'; 
    }
    else if (percentage >= 50) { 
      grade = 'C'; 
      category = 'Average'; 
    }
    else if (percentage >= 40) { 
      grade = 'D'; 
      category = 'Average'; 
    }
    else { 
      grade = 'F'; 
      category = 'Defaulter'; 
    }

    // Use Sequelize model update
    const [affectedRows] = await Performance.update(
      {
        student_id: student_id,
        semester: semester || 'Annual', // Provide default if empty
        academic_year: academic_year,
        behaviour_discipline: parseFloat(behaviour_discipline),
        academic_performance: parseFloat(academic_performance),
        extracurricular_participation: parseFloat(extracurricular_participation),
        punctuality: parseFloat(punctuality),
        total_score: total,
        percentage: percentage,
        grade: grade,
        category: category,
        remarks: remarks
      }, 
      {
        where: { id: parseInt(id) }
      }
    );

    if (affectedRows > 0) {
      console.log("Performance updated successfully!");
      res.json({ 
        success: true, 
        message: "Performance updated successfully!",
        data: {
          total_score: total,
          percentage: percentage,
          grade: grade,
          category: category
        }
      });
    } else {
      console.log("No performance record found to update");
      res.json({ 
        success: false, 
        message: "Performance record not found or no changes made." 
      });
    }
  } catch (error) {
    console.error("Error updating performance:", error);
    res.json({ 
      success: false, 
      message: "Error updating performance data." 
    });
  }
};