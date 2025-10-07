import json
import boto3
import requests

# Define your NewsAPI key here
NEWS_API_KEY = '5ae94531c1ad4c348a3bd640ded09c3b'
NEWS_API_URL = 'https://newsapi.org/v2/everything'

def get_news_from_api(topics):
    articles = []
    
    for topic in topics:
        params = {
            'q': topic,
            'apiKey': NEWS_API_KEY,
            'language': 'en',
            'pageSize': 5  # Limit the number of articles to retrieve
        }
        response = requests.get(NEWS_API_URL, params=params)
        if response.status_code == 200:
            news_data = response.json()
            articles.extend(news_data.get('articles', []))
        else:
            print(f"Failed to fetch news for topic {topic}: {response.status_code}")
    
    return articles

def lambda_handler(event, context):
    # Set your DynamoDB table name
    table_name = 'NewsFeed'

    try:
        # Parse the body from the event (stringified JSON inside)
        body_data = json.loads(event['body'])
        
        # Extract user ID and topics from the parsed body
        user_id = body_data['user_id']
        topics = body_data['topics']

        print(f"Received user_id: {user_id}, topics: {topics}")

        # Fetch articles from NewsAPI
        articles = get_news_from_api(topics)

        if not articles:
            return {
                'statusCode': 200,
                'body': json.dumps('No articles found for the provided topics.')
            }

        # Initialize the DynamoDB resource
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table(table_name)

        # Store articles in DynamoDB
        for article in articles:
            table.put_item(
                Item={
                    'UserID': user_id,
                    'Title': article['title'],
                    'Description': article['description'],
                    'URL': article['url'],
                    'PublishedAt': article['publishedAt'],
                    'Topic': ', '.join(topics)  # Store the topics searched
                }
            )

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'News articles successfully added!', 'articles_count': len(articles)})
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': f"Error occurred: {str(e)}"
        }