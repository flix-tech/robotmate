# ROBOT MATE

[![Build Status](https://travis-ci.org/flix-tech/robotmate.svg?branch=master)](https://travis-ci.org/flix-tech/robotmate)

## About

![robotmate](robotmate.jpg "Robot Mate")

This project is based on [Botium](https://botium.atlassian.net) and is used for testing the communication path with a chatbot using **dialogflow**. Here you will find how to setup and run the project, plus conversations simulating a real user in order to test the platform answers to guarantee a better coverage of the bot.

## Installation

### The easiest way

1. Start by downloading and installing [NodeJs](https://nodejs.org/en/download/)
2. Open your terminal (Mac, Linux, ...) or Prompt (Windows)
3. Execute the following command in the terminal: `npm install -g "git+https://git@github.com/flix-tech/robotmate.git#v0.10.0`

### Another way

1. Start by downloading and installing [NodeJs](https://nodejs.org/en/download/)
2. Open your terminal (Mac, Linux, ...) or Prompt (Windows)
3. Clone the repo by executing the following command in the terminal: `git clone "https://github.com/flix-tech/robotmate.git"`
4. Type `cd robotmate` and press enter to go inside of the project folder
5. Type `npm install -g .` to install it globally

### Main functionalities:

There are two main commands that can be executed after the project is installed:

1. __rmrun__ Runs one or more *RMC* files or *directory* using the provided Botium configuration.
2. __rmparse__ Parses an *RMC* file or *directory* and shows errors or the JSON output if it is valid.

We will explain more about these commands in the following sections.

## File extension

All the conversation files must have the extension **.rmc**. The *.rmc* means ***Robot Mate Conversations***.
Make sure that when creating a conversation file to rename the extension to ***.rmc***, otherwise the *Robot Mate* will **not** recognize them.

## Parser

The parser serves to check if your conversations are correctly implemented. It basically will verify your syntax and the structure of the conversation, e.g:

```r
rmparse <folder>
```

The results would be like the example below if everything is fine:

```r
=== Parsing: ../conversations/test1.rmc
  = OK
=== Parsing: ../conversations/test2.rmc
  = OK
```

And if something fails..

```javascript
=== Parsing: ../conversations/text3.rmc
/Users/flixbus/Documents/tests/rmcf/lib/parser.js:45

Error: The actor RM do not have the action exxcludes (Line: 8)
```

## Runner

In order to run the project just execute **rmrun** command inside the folder of your project. 
To see examples of further commands you can execute just type: `rmrun --help` in your terminal.
The code below shows an example on how to run a command that takes three parameters:

- **rmrun** **folder of the conversations** --conf **configuration file** --jobs **amount of jobs**

The command above can be used to run the tests within a folder, using the specified configs with N jobs in parallel.

### Params

1. **folder of the conversations** *(optional)*: The path for the folder containing the conversations. In case this parameter is not set, it will try to find the files in the *root* folder.

2. **--conf** **configuration file** *(optional)*: This where the path of the file to setup the botium capabilities can be set. In case the parameter is not set it will look inside of the *root* folder for a file called *botium.json*

3. **--jobs** **amount of jobs** *(optional)*: The name *jobs* is the equivalent to *threads*, so the parameter define the amount of jobs (threads) that will be used to split the load and test things in parallel in case it is necessary. Each thread works independently from each other.

### Different ways of using the parameters

***Specifying conversation folder***
```s
rmrun conversations/base/
```
***Specifying botium config file***
```s
rmrun --conf botium.json
```
***Specifying amount of jobs***
```s
rmrun --jobs 10
```
***Variation 1***
```s
rmrun conversations/base/ --jobs 10
```
***Variation 2***
```s
rmrun conversations/base/  --conf botium.json
```
***Variation 3***
```s
rmrun --conf botium.json --jobs 10
```

## Creating botium.json

In order to create your own configuration file, please access the following link: [Configuration](https://botium.atlassian.net/wiki/spaces/BOTIUM/pages/360603/Botium+Configuration+-+Capabilities)

## Conversation example

The follow script shows a small example of a conversation containing all **RM** *(Robot Mate)* and the **HM** *(Human Mate)* utterances:

```R
LANG: en_US

HM says : "I would like to talk"
RM includes any : "What" "about" "?"

HM says: "About intelligent machines."
RM excludes: "Ops" "I didn't understand"
RM start with: "Interesting"

HM says: "Do you know any?"
RM contains: "Yes"

HM says: "Can you tell me more?"
RM equals: "Yes, I'm an intelligent machine created to rule the world!"
```
### Parameters explanation

#### LANG

- The lang param is necessary for the ***RM*** to send to the platform which language it is speaking to guarantee understanding, otherwise sending a text in English and receiving an answer in German would be a problem.

#### HM

- The **HM** has only one statement, ***says***: The statement **says** sends a message to the platform simulating a human conversation.

#### RM

- Different from the *HM* the **RM** contains multiple statements which are necessary to *assert* the conversation.

1. **includes any**: *Includes any* checks if any of the texts stated is in the message.
    - e.g: The statement below is checking if the **What** *or* **about** *or* **?** is included in the received message.

    ```r
        RM includes any : "What" "about" "?"
    ```

2. **excludes**: *Excludes* checks if every following text stated is not in the message.
    - e.g: The statement below is checking if the **Ops** *and* **I didn't understand** is not in the received message.

    ```r
        RM excludes: "Ops" "I didn't understand"
    ```

3. **start with**: *Start with* verifies if the message checked must start with the text stated.
    - e.g: The statement below is checking if **Interesting** is at the beginning of the message.

    ```r
        RM start with: "Interesting"
    ```

4. **contains**: This statement has the same functionality of the method contains used in programming languages.
    *Contains* checks if the given text is included in the received message. The difference between this statement and the *includes any* statement is that **contains** only accepts one given text.
    - e.g: The statement below is checking if the **Yes** is included in the received message.

    ```r
       RM contains: "Yes"
    ```

5. **equals**: Use this statement to check if the texts stated is exactly the message.
    - e.g: The statement below is checking if the **Yes, I'm an intelligent machine created to rule the world!** is exactly the received message.

    ```r
        RM equals: "Yes, I'm an intelligent machine created to rule the world!"
    ```

## Here is a real example of a robot mate execution

Executing the command below will initiate the process of sending message to the bot simulating an user interaction. The target *folder* has two tests which will be executed in sequence.

```r
rmrun ../conversations/base/exploratory_test/connection/ --conf ../botium.json 
```

```JAVA
find_a_ride_layover_station_change.rmc ::: The runner says : I would like to go from Munich to Berlin tomorrow
find_a_ride_layover_station_change.rmc ::: Robot says:  I recommend this direct FlixBus ride that departs from Munich central bus station to Berlin central bus station on Thursday, 16th of May at 9:10, costs $27.99 and lasts 7 hours 5 minutes. Would you like to select this option?
find_a_ride_layover_station_change.rmc ::: === Lets check the robot message!
find_a_ride_layover_station_change.rmc ::: Assertion:  RM includes any : "Is this an option for you?" "Would you like to select this option?"
find_a_ride_layover_station_change.rmc ::: === Good!
find_a_ride_layover_duration.rmc ::: The runner says : I would like to go from Munich to Berlin tomorrow
find_a_ride_layover_duration.rmc ::: Robot says:  I recommend this direct FlixBus ride that departs from Munich central bus station to Berlin central bus station on Thursday, 16th of May at 9:10, costs $27.99 and lasts 7 hours 5 minutes. Would you like to select this option?
find_a_ride_layover_duration.rmc ::: === Lets check the robot message!
find_a_ride_layover_duration.rmc ::: Assertion:  RM includes any : Is this an option for you?" "Would you like to select this option?
find_a_ride_layover_duration.rmc ::: === Good!
find_a_ride_layover_duration.rmc ::: The runner says : How long is the stop duration?
find_a_ride_layover_duration.rmc ::: Robot says:  This ride has no change and goes directly to the destination. Is this an option for you?
find_a_ride_layover_duration.rmc ::: === Lets check the robot message!
find_a_ride_layover_duration.rmc ::: Assertion:  RM excludes : "None" "Oops!"
find_a_ride_layover_duration.rmc ::: Assertion:  RM includes any : "The duration of the change is" "This ride has no change"
find_a_ride_layover_duration.rmc ::: === Good!
find_a_ride_layover_station_change.rmc ::: The runner says : Do I need to change the station?
find_a_ride_layover_station_change.rmc ::: Robot says:  This ride has no change and goes directly to the destination. Is this an option for you?
find_a_ride_layover_station_change.rmc ::: === Lets check the robot message!
find_a_ride_layover_station_change.rmc ::: Assertion:  RM excludes : "None" "Oops"
find_a_ride_layover_station_change.rmc ::: Assertion:  RM includes any : "You don't need to change stations for this interconnection." "This ride has no change and goes directly to the destination."
find_a_ride_layover_station_change.rmc ::: === Good!

Conversations:  2 passed,  2 total
Duration: 7.57 seconds
```

In case of some conversation fails it will show the path of the file at the end, e.g:

```r
Conversations: 1 failed,  1 passed,  2 total
Duration: 7.13 seconds
1 failed conversations:
/Users/flix/conversations/base/exploratory_test/connection/find_a_ride_layover_duration.rmc
```

# Conclusion

For sure there are many things to improve and a lot to learn about bot automation. Although, the framework provides an easy way to automate your tests for bots and it helps to increase your coverage, for now it cannot cover all the possible cases as it focuses more on the text messages.
