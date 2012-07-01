Introduction
============
JAR JVM is a Java Virtual Machine interpreter that is written completely in JavaScript. As a result, it runs entirely in your browser -- no plugins required!

Usage
=====
In order to use JAR JVM, you must do the following:

1. JAR JVM currently requires a copy of the Java Class Library. We do not distribute this with JAR JVM. The command to do this on a Mac is the following:
> cd jre/
> unzip /System/Library/Frameworks/JavaVM.framework/Classes/classes.jar
2. Once that is done, run server.py to run a simple HTTP server locally that serves the JVM.
3. Open http://localhost:8000/ in your browser of choice and enjoy!*

* Currently supported browsers: The latest versions of Firefox, Opera, and Chrome. No promises for IE users!

Status
======
JAR JVM is currently in extreme alpha state. We are working hard to create a subtantial body of unit tests to the existing code before adding new features.

Once that is done, we have a number of exciting feature ideas!

Name
====
Why is it called JAR JVM? Well, JAR JVM was initially developed by three people for a class project:

__J__ohn Vilk
__A__meer Rahmati
__R__yan Hurley
