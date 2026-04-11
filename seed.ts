import { users, students, classes, curriculum, lessonProgress, lessonPlans, studentReports } from './src/data/mockData.ts';
import fs from 'fs';
fs.writeFileSync('seed_data.json', JSON.stringify({users, students, classes, curriculum, lessonProgress, lessonPlans, studentReports}, null, 2));
