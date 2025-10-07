// Add your API endpoint here
var API_ENDPOINT = "https://9imw8vrtgb.execute-api.us-east-1.amazonaws.com/prod";

// Function to show the registration section
function showRegistration() {
    document.getElementById("registerSection").style.display = "block";
    document.getElementById("viewFeedSection").style.display = "none";
}

// Function to show the news feed section
function showNewsFeed() {
    document.getElementById("registerSection").style.display = "none";
    document.getElementById("viewFeedSection").style.display = "block";
}

// Show the registration section by default
showRegistration();

// AJAX POST request to save user data
document.getElementById("saveuser").onclick = function() {
    var username = document.getElementById('username').value;
    var topics = document.getElementById('topics').value;

    // Check for empty fields
    if (!username || !topics) {
        alert("Please fill in both fields.");
        return;
    }

    // Create the data structure for DynamoDB
    var inputData = {
        "body": JSON.stringify({
            "user_id": username,
            "topics": topics.split(',').map(topic => topic.trim())
        })
    };

    $.ajax({
        url: API_ENDPOINT,
        type: 'POST',
        data: JSON.stringify(inputData),
        contentType: 'application/json; charset=utf-8',
        success: function(response) {
            document.getElementById("userSaved").innerHTML = "User Data Saved!";
            console.log("Success:", response);
        },
        error: function(xhr, status, error) {
            console.error("Error saving user data:", xhr.responseText);
            alert("Error saving user data. Please try again.");
        }
    });
}

// Load news feeds on button click
document.getElementById("getusers").onclick = function() {
    $.ajax({
        url: API_ENDPOINT,
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        success: function(response) {
            try {
                // Parse the response only if it's valid JSON
                if (response.body) {
                    response = JSON.parse(response.body);
                } else {
                    response = JSON.parse(response);
                }

                // Clear previous news feed
                var newsFeedContainer = document.getElementById("newsFeedContainer");
                newsFeedContainer.innerHTML = "";

                // Check if there are any news articles for the user's topics
                if (response.length === 0) {
                    newsFeedContainer.innerHTML = "<p>No news articles available for the selected topics.</p>";
                    return;
                }

                // Loop through the news feed for the user's topics
                response.forEach(function(data) {
                    let article = `
                        <div class="news-item">
                            <div class="news-image">
                                <img src="https://s.wordpress.com/mshots/v1/${data['URL']}" alt="${data['Title']}">
                            </div>
                            <div class="news-details">
                                <h3>${data['Title']}</h3>
                                <p><strong>Topic:</strong> ${data['Topic']}</p>
                                <p><strong>Description:</strong> ${data['Description']}</p>
                                <p><strong>Published At:</strong> ${new Date(data['PublishedAt']).toLocaleString()}</p>
                                <a href="${data['URL']}" target="_blank">Read More</a>
                            </div>
                        </div>`;
                    newsFeedContainer.innerHTML += article;
                });
            } catch (e) {
                console.error("Error parsing JSON response:", e);
                alert("An error occurred while processing the news feed. Please try again.");
            }
        },
        error: function(xhr, status, error) {
            console.error("Error retrieving news feed data:", xhr.responseText);
            alert("Error retrieving news feed data. Please try again.");
        }
    });
}

// Event listeners for buttons to switch views
document.getElementById("goToViewFeed").onclick = showNewsFeed;
