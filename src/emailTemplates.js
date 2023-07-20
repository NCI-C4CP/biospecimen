import { urls } from "./shared.js";

export const baselineEmailTemplate = (data, isClinical) => {
  
    let appLocation = '';
    let supportLocation = '';

    if(location.host === urls.prod) {
        appLocation = "https://myconnect.cancer.gov/";
        supportLocation = "https://myconnect.cancer.gov/support";
    }
    else if(location.host === urls.stage) {
        appLocation = "https://myconnect-stage.cancer.gov/";
        supportLocation = "https://myconnect-stage.cancer.gov/support";
    }
    else {
        appLocation = "https://episphere.github.io/connectApp/";
        supportLocation = "https://episphere.github.io/connectApp/support";
    }

    let loginDetails;
                    
    if(data[995036844] === 'phone' && data[348474836]) {
        loginDetails = data[348474836];
        loginDetails = "***-***-" + loginDetails.substring(loginDetails.length - 4);
    }
    else if(data[995036844] === 'password' && data[421823980]) {
        loginDetails = data[421823980];

        let amp = loginDetails.indexOf('@');    
        for(let i = 0; i < amp; i++) {
            if(i != 0 && i != 1 && i != amp - 1) {
                loginDetails = loginDetails.substring(0, i) + "*" + loginDetails.substring(i + 1);
            } 
        }
    }

    return `
        Dear ${data['399159511']},
        <br/>
        <br/>
        Thank you for donating your samples for the Connect for Cancer Prevention Study! Next, please visit the <a href=${appLocation}>MyConnect app</a> to answer the ${isClinical ? 'Baseline Blood and Urine Sample Survey' : 'Baseline Blood, Urine, and Mouthwash Sample Survey'}. This short survey asks questions about the day that you donated samples, so it is important to complete it as soon as you can.
        <br/>
        <br/>
        A new survey about your experience with COVID-19 is also available on MyConnect. Please complete this survey as soon as you can.
        <br/>
        <br/>
        Please use ${loginDetails} to access the survey on the MyConnect app. If you forgot your login information or have questions, please contact the <a href=${supportLocation}>Connect Support Center.</a>
        <br/>
        <br/>
        Thank you for your commitment to helping us learn how to better prevent cancer.
        <br/>
        <br/>
        Sincerely,
        <br/>
        the Connect team at the National Cancer Institute
        <br/>
        9609 Medical Center Drive, Rockville MD 20850
        <br/>
        <img src="https://raw.githubusercontent.com/episphere/connectApp/master/images/new_logo.png" style="width:150px;height:40px;">
        <br/>
        <br/>
        <em>To protect your information, we follow federal privacy rules, including the <a href="https://www.justice.gov/archives/opcl/overview-privacy-act-1974-2015-edition">Privacy Act</a> and the <a href="https://grants.nih.gov/grants/guide/notice-files/NOT-OD-19-050.html">Common Rule</a>.</em>
        <br/>
        <br/>
        <em>This message is private. If you have received it by mistake, please let us know by emailing ConnectSupport@NORC.org, and please kindly delete the message. If you are not the right recipient, please do not share this message with anyone.</em>
    `;
};