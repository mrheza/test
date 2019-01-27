# Requirements

1\. Node Js 8.10.

2\. MySQL 5.7.

# Program List

There are 2 program in this repository. It is problem-one(concurrency problem) and problem-two(real time problem).

# problem-one

1\. Dump sql file in problem-one folder.

```
	host     : 'localhost'
    user     : 'root'
    password : ''
    database : 'sayurbox'
```

2\. Run app server.

Open problem-one folder in command prompt and you can run the following command:

```
	node server.js
```

3\. Open browser and access this url:


```
	http://localhost:3000/
```

4\. Scenario test.

You can install this application in multiple computers. And then, add item to your cart, click cart icon on the right top then click checkout concurrently with other user.
One of the other users trasaction will be success. For a simple test, you can run the follwing command for another scenario test:

```
	node concurrency-test.js
```

This command will execute method parallely to test concurrency. Thera are 2 order scenario, susan and manda.

# problem-two

