sophtwhere-timer beta test installation procedure
---

To install **sophtwhere-timer** for beta testing, first have a functional companion install 

This release has been tessted against `companion-win64-3.0.1+6068-stable-a05a9c89.exe`

You can download Companion from https://user.bitfocus.io/download

Note - downloads require a free registration/login  from https://user.bitfocus.io/login 

Once you have installed Companion, you need to locate the  `bundled-modules` folder 

For example the default location on a Windows installation is something like 

    `C:\Program Files\Companion\resources\bundled-modules`

If you're reading this help file, the assumption is that you've already downloaded and extracted the zip file that this help file lives in. 

That being the case, you should have noticed that alongside this file there is a folder called  `bundled-modules` which has a single folder inside it, called `sophtwhere-timer`

Your goal is to drag or copy/paste the `sophtwhere-timer` from inside the `bundled-modules` that was in the zip file, into the `bundled-modules` of your Companion installation

And that's it!

When you restart Companion, the **sophtwhere:timer** connection will exist in Companion.

To get you started, there's a page of test buttons pre-configured in the `default-tests.companionconfig` file, which you can import to a page in your Companion surface

