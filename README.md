This version of the extension was tested with Brackets Sprint 20.


Brackets Continuous Compilation Extension
=========================================

This is an extension for [Adobe Brackets][1] to improve on the built-in JSLint-check. The built-in check only runs when the file is saved and only displays a list of error messages at the bottom of the editor. This extension improves on this in the following ways:

* Check while editing the code: JSLint is run whenever a file is changed (possibly whith each newly typed character), giving much more direct feedback.
* Highlight errors in the code, not just display messages at the bottom of the editor.
	* Lines with errors have a marker in the line gutter indicating that something is wrong in this line
	* Infringing code is underlined, to help find the error quickly
	* When something is missing (e.g. a semicolon or spaces) an insertion marker is displayed at the approprate position
* The error locations reported by JSLint have been improved for several cases. E.g. an empty block is not reported at the next statement AFTER the empty block (possibly several lines later) but in the last line of the empty block itself.
* Clicking on the line gutter in a line with errors will open a line widget showing the error messages aligned to the error they belong to.
* Not all JSLint errors are created equal. Sometimes JSLint reports syntax errors, sometimes it just complains about missing spaces. Therefore, this extension groups the errors reported into several groups, allowing you to easily see which ones are important and ignore the unimportant ones:
	* syntax errors: Dark red, most of the time the code will not compile without these being fixed. 
	* unclassified: light red, those have not been assigned to a group yet. Usually this is due to me not being able to reproduce them or find enough information about them to make a decision.
	* bad code or practice: orange. Likely a coding error, possibly just really bad pratice. Often compiles but would likely crash when run or do something unexpected. Should most probably be fixed.
	* warning: Will usually compile and run, but could indicate an error, e.g. redeclaring a variable or not using a declared variable (this one is not implemented yet).
	* just style: Things that do no influence the semantics and are just due to personal style, e.g. how many spaces you have between operator and operands etc.
	* (I'm open to discussions regarding the assignment of errors to severity levels)
* It uses a newer version of JSLint that reports some more errors and had some bugs fixed.


This is still very much a beta version. I've used it successfully in developing the extension itself and think it's ready to be tested by others. 

However, I've not tested it on huge files and although I already worked on the performance a bit, it might be a bit slow sometimes. If you notice it being slow and have an idea how to fix it, tell me or submit a pull-request. 

So far, I have only tested it (and limited the extension to only check) Javascript files. It does

It also crashes sometimes, usually this does not affect brackets, but there may be no highlights anymore or clicking on the line gutter does not display the error messages. In these cases, just reload brackets (Ctrl/Cmd-R) and everything should work again. If you notice why that is please tell me or fix it and submit a pull request. ;-)




If you have any questions or feature requests or found bugs [contact me][2] or [create an issue][3].


How to install the extension
-----------------------------
Just put the folder ./Plugin-Code in Brackets' extension folder (you can find it via the Brackets menu "Help" -> "Show Extensions Folder"). In there put the Plugin-Code folder in the "user" folder of the extensions folder. You may also put it in a folder called "dev" if you like.

You can open the code in the ".example code" folder to see a variety of errors reported by this extension. Or just start writing your own code or open your own project to see it display errors and warnings. ;-)


Contribute
-----------------
Feel free to fork the repository and work on some of the [issues that are already there][3] or add something yourself.


[1]: https://github.com/adobe/brackets
[2]: mailto:github@joachim.monoceres.uberspace.de
[3]: https://github.com/JoachimK/brackets-continuous-compilation/issues