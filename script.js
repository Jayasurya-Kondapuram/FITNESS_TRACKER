        // App State
        let userData = null;
        let foodEntries = [];
        let waterIntake = 0;
        let activeTab = 'dashboard';

        // Common foods database (per 100g)
        const commonFoods = {
            'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
            'brown rice': { calories: 123, protein: 2.6, carbs: 23, fat: 0.9 },
            'broccoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
            'salmon': { calories: 208, protein: 22, carbs: 0, fat: 12 },
            'eggs': { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
            'oatmeal': { calories: 68, protein: 2.4, carbs: 12, fat: 1.4 },
            'banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
            'almonds': { calories: 579, protein: 21, carbs: 22, fat: 50 },
            'greek yogurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
            'sweet potato': { calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
            'avocado': { calories: 160, protein: 2, carbs: 9, fat: 15 },
            'quinoa': { calories: 120, protein: 4.4, carbs: 22, fat: 1.9 }
        };

        // Initialize app
        document.addEventListener('DOMContentLoaded', function() {
            loadFromStorage();
            if (userData) {
                showMainApp();
            }
            setupEventListeners();
        });

        // Event Listeners
        function setupEventListeners() {
            // Tab navigation
            document.querySelectorAll('.tab').forEach(tab => {
                tab.addEventListener('click', () => switchTab(tab.dataset.tab));
            });

            // Profile form
            document.getElementById('userProfileForm').addEventListener('submit', handleProfileSubmit);
            document.getElementById('updateProfileForm').addEventListener('submit', handleUpdateProfile);
            document.getElementById('goalsForm').addEventListener('submit', handleGoalsSubmit);
            document.getElementById('addFoodForm').addEventListener('submit', handleAddFood);

            // Food search
            document.getElementById('foodName').addEventListener('input', handleFoodSearch);
        }

        // Local Storage
        function saveToStorage() {
            if (userData) localStorage.setItem('fitnessApp_userData', JSON.stringify(userData));
            localStorage.setItem('fitnessApp_foodEntries', JSON.stringify(foodEntries));
            localStorage.setItem('fitnessApp_waterIntake', waterIntake.toString());
        }

        function loadFromStorage() {
            const saved = localStorage.getItem('fitnessApp_userData');
            if (saved) userData = JSON.parse(saved);

            const savedFood = localStorage.getItem('fitnessApp_foodEntries');
            if (savedFood) foodEntries = JSON.parse(savedFood);

            const savedWater = localStorage.getItem('fitnessApp_waterIntake');
            if (savedWater) waterIntake = parseInt(savedWater);
        }

        // Navigation
        function switchTab(tabName) {
            // Update active tab
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.toggle('active', tab.dataset.tab === tabName);
            });

            // Show/hide content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.toggle('active', content.id === tabName);
            });

            activeTab = tabName;
            
            if (tabName === 'dashboard') updateDashboard();
            if (tabName === 'profile') populateProfileForm();
        }

        // Profile Management
        function handleProfileSubmit(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            userData = {
                name: formData.get('name') || document.getElementById('name').value,
                age: parseInt(document.getElementById('age').value),
                gender: document.getElementById('gender').value,
                height: parseInt(document.getElementById('height').value),
                weight: parseInt(document.getElementById('weight').value),
                bodyFat: parseInt(document.getElementById('bodyFat').value),
                goals: calculateDefaultGoals()
            };

            saveToStorage();
            showMainApp();
        }

        function handleUpdateProfile(e) {
            e.preventDefault();
            
            userData.name = document.getElementById('updateName').value;
            userData.age = parseInt(document.getElementById('updateAge').value);
            userData.gender = document.getElementById('updateGender').value;
            userData.height = parseInt(document.getElementById('updateHeight').value);
            userData.weight = parseInt(document.getElementById('updateWeight').value);
            userData.bodyFat = parseInt(document.getElementById('updateBodyFat').value);

            saveToStorage();
            updateDashboard();
            updateRecommendations();
            alert('Profile updated successfully!');
        }

        function populateProfileForm() {
            if (!userData) return;
            
            document.getElementById('updateName').value = userData.name;
            document.getElementById('updateAge').value = userData.age;
            document.getElementById('updateGender').value = userData.gender;
            document.getElementById('updateHeight').value = userData.height;
            document.getElementById('updateWeight').value = userData.weight;
            document.getElementById('updateBodyFat').value = userData.bodyFat;

            // Goals
            document.getElementById('dailyCalories').value = userData.goals.dailyCalories;
            document.getElementById('dailyProtein').value = userData.goals.dailyProtein;
            document.getElementById('dailyCarbs').value = userData.goals.dailyCarbs;
            document.getElementById('dailyFat').value = userData.goals.dailyFat;
            document.getElementById('dailyWater').value = userData.goals.dailyWater;
            document.getElementById('workoutDays').value = userData.goals.workoutDays || 4;

            updateRecommendations();
        }

        function calculateDefaultGoals() {
            const { gender, weight, height, age } = userData || {};
            
            const bmr = gender === 'male' 
                ? 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
                : 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
            
            const tdee = bmr * 1.6;
            const protein = weight * 2;
            const fat = weight * 1;
            const carbs = (tdee - (protein * 4) - (fat * 9)) / 4;
            const water = weight * 35;

            return {
                dailyCalories: Math.round(tdee),
                dailyProtein: Math.round(protein),
                dailyCarbs: Math.round(carbs),
                dailyFat: Math.round(fat),
                dailyWater: Math.round(water),
                workoutDays: 4
            };
        }

        function updateRecommendations() {
            if (!userData) return;
            
            const recommended = calculateDefaultGoals();
            
            document.getElementById('caloriesRec').textContent = `Recommended: ${recommended.dailyCalories} kcal`;
            document.getElementById('proteinRec').textContent = `Recommended: ${recommended.dailyProtein}g (2g per kg body weight)`;
            document.getElementById('carbsRec').textContent = `Recommended: ${recommended.dailyCarbs}g`;
            document.getElementById('fatRec').textContent = `Recommended: ${recommended.dailyFat}g (1g per kg body weight)`;
            document.getElementById('waterRec').textContent = `Recommended: ${recommended.dailyWater}ml (35ml per kg body weight)`;
        }

        function applyRecommendedGoals() {
            const recommended = calculateDefaultGoals();
            
            document.getElementById('dailyCalories').value = recommended.dailyCalories;
            document.getElementById('dailyProtein').value = recommended.dailyProtein;
            document.getElementById('dailyCarbs').value = recommended.dailyCarbs;
            document.getElementById('dailyFat').value = recommended.dailyFat;
            document.getElementById('dailyWater').value = recommended.dailyWater;
        }

        function handleGoalsSubmit(e) {
            e.preventDefault();
            
            userData.goals = {
                dailyCalories: parseInt(document.getElementById('dailyCalories').value),
                dailyProtein: parseInt(document.getElementById('dailyProtein').value),
                dailyCarbs: parseInt(document.getElementById('dailyCarbs').value),
                dailyFat: parseInt(document.getElementById('dailyFat').value),
                dailyWater: parseInt(document.getElementById('dailyWater').value),
                workoutDays: parseInt(document.getElementById('workoutDays').value)
            };

            saveToStorage();
            updateDashboard();
            alert('Goals updated successfully!');
        }

        // App Display
        function showMainApp() {
            document.getElementById('loginScreen').classList.add('hidden');
            document.getElementById('mainApp').classList.remove('hidden');
            document.getElementById('welcomeMessage').textContent = 
                `Welcome back, ${userData.name}! Let's crush those goals today 💪`;
            updateDashboard();
        }

        function updateDashboard() {
            if (!userData) return;

            // Basic stats
            document.getElementById('currentWeight').textContent = `${userData.weight} kg`;
            document.getElementById('bodyFatDisplay').textContent = `Body Fat: ${userData.bodyFat}%`;
            
            const bmi = (userData.weight / ((userData.height / 100) ** 2)).toFixed(1);
            document.getElementById('bmiValue').textContent = bmi;

            // Today's nutrition
            const todaysNutrition = getTodaysNutrition();
            
            document.getElementById('dailyCalories').textContent = Math.round(todaysNutrition.calories);
            document.getElementById('calorieGoal').textContent = `Goal: ${userData.goals.dailyCalories}`;

            // Update progress circles
            updateProgressCircle('proteinProgress', 'proteinPercent', 'proteinCurrent', 
                todaysNutrition.protein, userData.goals.dailyProtein, 'g');
            updateProgressCircle('calorieProgress', 'caloriePercent', 'calorieCurrent', 
                todaysNutrition.calories, userData.goals.dailyCalories, 'kcal');
            updateProgressCircle('waterProgress', 'waterPercent', 'waterCurrent', 
                waterIntake, userData.goals.dailyWater, 'ml');
            updateProgressCircle('macroProgress', 'macroPercent', 'macroCurrent', 
                todaysNutrition.carbs + todaysNutrition.fat, 
                userData.goals.dailyCarbs + userData.goals.dailyFat, 'g');

            // Update nutrition summary
            updateNutritionSummary(todaysNutrition);

            // Update water tracker
            updateWaterDisplay();

            // Update suggestions
            updateSuggestions(todaysNutrition);
        }

        function updateProgressCircle(circleId, percentId, currentId, current, goal, unit) {
            const percentage = Math.min((current / goal) * 100, 100);
            const circumference = 2 * Math.PI * 45;
            const offset = circumference - (percentage / 100) * circumference;
            
            document.getElementById(circleId).style.strokeDashoffset = offset;
            document.getElementById(percentId).textContent = `${Math.round(percentage)}%`;
            document.getElementById(currentId).textContent = 
                `${Math.round(current)} / ${Math.round(goal)} ${unit}`;
        }

        // Food Tracking
        function getTodaysNutrition() {
            const today = new Date().toDateString();
            const todaysEntries = foodEntries.filter(entry => 
                new Date(entry.timestamp).toDateString() === today
            );
            
            return todaysEntries.reduce((totals, entry) => ({
                calories: totals.calories + entry.calories,
                protein: totals.protein + entry.protein,
                carbs: totals.carbs + entry.carbs,
                fat: totals.fat + entry.fat
            }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
        }

        function handleFoodSearch(e) {
            const query = e.target.value.toLowerCase();
            const suggestions = document.getElementById('foodSuggestions');
            
            if (query.length === 0) {
                suggestions.classList.add('hidden');
                return;
            }
            
            const matches = Object.keys(commonFoods).filter(food => 
                food.includes(query)
            ).slice(0, 5);
            
            if (matches.length === 0) {
                suggestions.classList.add('hidden');
                return;
            }
            
            suggestions.innerHTML = matches.map(food => 
                `<div style="padding: 0.5rem; cursor: pointer;" onclick="selectFood('${food}')">${food}</div>`
            ).join('');
            
            suggestions.classList.remove('hidden');
        }

        function selectFood(foodName) {
            document.getElementById('foodName').value = foodName;
            document.getElementById('foodSuggestions').classList.add('hidden');
        }

        function handleAddFood(e) {
            e.preventDefault();
            
            const foodName = document.getElementById('foodName').value.toLowerCase();
            const grams = parseInt(document.getElementById('foodGrams').value);
            
            const nutrition = calculateNutrition(foodName, grams);
            
            const entry = {
                id: Date.now().toString(),
                name: foodName,
                grams,
                ...nutrition,
                timestamp: new Date().toISOString()
            };
            
            foodEntries.push(entry);
            saveToStorage();
            
            // Clear form
            document.getElementById('foodName').value = '';
            document.getElementById('foodGrams').value = '';
            
            updateDashboard();
            updateFoodEntries();
        }

        function calculateNutrition(foodName, grams) {
            const nutritionData = commonFoods[foodName];
            
            if (nutritionData) {
                const multiplier = grams / 100;
                return {
                    calories: Math.round(nutritionData.calories * multiplier),
                    protein: Math.round(nutritionData.protein * multiplier * 10) / 10,
                    carbs: Math.round(nutritionData.carbs * multiplier * 10) / 10,
                    fat: Math.round(nutritionData.fat * multiplier * 10) / 10
                };
            }
            
            // Fallback estimates
            return {
                calories: Math.round(grams * 2.5),
                protein: Math.round(grams * 0.15 * 10) / 10,
                carbs: Math.round(grams * 0.5 * 10) / 10,
                fat: Math.round(grams * 0.1 * 10) / 10
            };
        }

        function updateNutritionSummary(nutrition) {
            document.getElementById('totalCalories').textContent = Math.round(nutrition.calories);
            document.getElementById('totalProtein').textContent = `${Math.round(nutrition.protein)}g`;
            document.getElementById('totalCarbs').textContent = `${Math.round(nutrition.carbs)}g`;
            document.getElementById('totalFat').textContent = `${Math.round(nutrition.fat)}g`;
            
            if (userData) {
                document.getElementById('caloriesGoalText').textContent = `Goal: ${userData.goals.dailyCalories}`;
                document.getElementById('proteinGoalText').textContent = `Goal: ${userData.goals.dailyProtein}g`;
                document.getElementById('carbsGoalText').textContent = `Goal: ${userData.goals.dailyCarbs}g`;
                document.getElementById('fatGoalText').textContent = `Goal: ${userData.goals.dailyFat}g`;
            }
        }

        function updateFoodEntries() {
            const today = new Date().toDateString();
            const todaysEntries = foodEntries.filter(entry => 
                new Date(entry.timestamp).toDateString() === today
            );
            
            const container = document.getElementById('foodEntries');
            
            if (todaysEntries.length === 0) {
                container.innerHTML = `
                    <p style="text-align: center; color: var(--text-muted); padding: 2rem;">
                        No food entries for today. Start tracking your nutrition above!
                    </p>
                `;
                return;
            }
            
            container.innerHTML = todaysEntries.map(entry => `
                <div class="food-entry">
                    <div class="food-info">
                        <h4>${entry.name}</h4>
                        <div class="food-details">
                            ${entry.grams}g • ${entry.calories} cal • P:${entry.protein}g • C:${entry.carbs}g • F:${entry.fat}g
                        </div>
                    </div>
                    <div class="food-time">
                        ${new Date(entry.timestamp).toLocaleTimeString()}
                    </div>
                </div>
            `).join('');
        }

        // Water Tracking
        function addWater(amount) {
            waterIntake = Math.max(0, waterIntake + amount);
            saveToStorage();
            updateWaterDisplay();
            updateDashboard();
        }

        function resetWater() {
            waterIntake = 0;
            saveToStorage();
            updateWaterDisplay();
            updateDashboard();
        }

        function updateWaterDisplay() {
            if (!userData) return;
            
            const goal = userData.goals.dailyWater;
            const percentage = Math.min((waterIntake / goal) * 100, 100);
            const remaining = Math.max(0, goal - waterIntake);
            
            document.getElementById('waterLevel').style.height = `${percentage}%`;
            document.getElementById('waterPercentage').textContent = `${Math.round(percentage)}%`;
            document.getElementById('waterAmount').textContent = `${waterIntake}ml`;
            document.getElementById('waterGoalText').textContent = `${waterIntake}ml / ${goal}ml`;
            document.getElementById('waterProgressBar').style.width = `${percentage}%`;
            document.getElementById('waterRemaining').textContent = `${remaining}ml`;
            
            const statusEl = document.getElementById('waterStatus');
            if (percentage >= 100) {
                statusEl.innerHTML = `
                    <div style="color: var(--accent); font-weight: 500;">
                        🎉 Great job! You've reached your daily water goal!
                    </div>
                `;
            } else {
                statusEl.innerHTML = `
                    <div style="color: var(--text-muted);">
                        You need <span id="waterRemaining">${remaining}ml</span> more to reach your daily goal
                    </div>
                `;
            }
            
            // Enable/disable buttons
            document.getElementById('removeWaterBtn').disabled = waterIntake < 100;
            document.getElementById('resetWaterBtn').disabled = waterIntake === 0;
        }

        // Suggestions
        function updateSuggestions(nutrition) {
            if (!userData) return;
            
            const suggestions = [];
            const proteinDeficit = userData.goals.dailyProtein - nutrition.protein;
            const calorieDeficit = userData.goals.dailyCalories - nutrition.calories;
            
            if (proteinDeficit > 20) {
                suggestions.push({
                    icon: '🍗',
                    title: 'Boost Your Protein',
                    description: 'Try grilled chicken breast (150g) or Greek yogurt with almonds',
                    priority: 'high'
                });
            }
            
            if (calorieDeficit > 300) {
                suggestions.push({
                    icon: '🍌',
                    title: 'Healthy Calorie Boost',
                    description: 'Add a banana with peanut butter or oatmeal with berries',
                    priority: 'medium'
                });
            }
            
            if (nutrition.calories > userData.goals.dailyCalories * 1.1) {
                suggestions.push({
                    icon: '🏃‍♂️',
                    title: 'Extra Cardio Session',
                    description: '20-30 minutes of moderate cardio to balance calorie intake',
                    priority: 'high'
                });
            }
            
            const currentHour = new Date().getHours();
            if (currentHour >= 6 && currentHour <= 10) {
                suggestions.push({
                    icon: '⚡',
                    title: 'Morning Energy Boost',
                    description: '15-minute HIIT workout to start your day strong',
                    priority: 'medium'
                });
            }
            
            const container = document.getElementById('suggestionsContainer');
            
            if (suggestions.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 2rem;">
                        <div style="font-size: 2rem; margin-bottom: 1rem;">🎉</div>
                        <p style="color: var(--text-muted);">
                            You're doing great! Keep up the excellent work with your nutrition and fitness goals.
                        </p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = suggestions.map(suggestion => `
                <div class="suggestion-item">
                    <div class="suggestion-icon">${suggestion.icon}</div>
                    <div class="suggestion-content">
                        <h4>
                            ${suggestion.title}
                            <span class="priority-badge priority-${suggestion.priority}">${suggestion.priority}</span>
                        </h4>
                        <p style="color: var(--text-muted); font-size: 0.85rem;">
                            ${suggestion.description}
                        </p>
                    </div>
                </div>
            `).join('');
        }

        // Account Management
        function logout() {
            document.getElementById('mainApp').classList.add('hidden');
            document.getElementById('loginScreen').classList.remove('hidden');
        }

        function resetAllData() {
            if (confirm('Are you sure you want to permanently delete all your data? This action cannot be undone.')) {
                localStorage.clear();
                userData = null;
                foodEntries = [];
                waterIntake = 0;
                logout();
            }
        }

        // Initialize food entries and water display on load
        setTimeout(() => {
            if (userData) {
                updateFoodEntries();
                updateWaterDisplay();
            }
        }, 100);