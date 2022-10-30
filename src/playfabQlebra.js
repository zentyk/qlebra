function DoExampleLoginWithCustomID() {
    PlayFab.settings.titleId = "262FA";
    var loginRequest = {
        // Currently, you need to look up the correct format for this object in the API-docs:
        // https://api.playfab.com/Documentation/Client/method/LoginWithCustomID
        TitleId: PlayFab.settings.titleId,
        CustomId: "anonymous",
        CreateAccount: true
    };

    PlayFabClientSDK.LoginWithCustomID(loginRequest, LoginCallback);
}

function TrackPlayfabEvent(eventName, eventValue) {
    var request = {
        EventName: eventName,
        Body: {
            "eventValue": eventValue
        }
    };
    PlayFabClientSDK.WritePlayerEvent(request, WriteEventCallback);
}

WriteEventCallback = function (result, error) {
    if (result !== null) {
        //console.log("Congratulations, you made your first successful API call!");
    }
};

var LoginCallback = function (result, error) {
    if (result !== null) {
        //console.log("Congratulations, you made your first successful API call!");
    } else if (error !== null) {
        //console.error("Something went wrong with your first API call.\n" +"Here's some debug information:\n" +CompileErrorReport(error));
    }
}

// This is a utility function we haven't put into the core SDK yet.  Feel free to use it.
function CompileErrorReport(error) {
    if (error === null)
        return "";
    var fullErrors = error.errorMessage;
    for (var paramName in error.errorDetails)
        for (var msgIdx in error.errorDetails[paramName])
            fullErrors += "\n" + paramName + ": " + error.errorDetails[paramName][msgIdx];
    return fullErrors;
}