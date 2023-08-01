export let  regularExpData = [
  {
      name: "phoneNo",
      regExp: /^\d{10}$/,
      message: "Invalid Phone Number"
  },
  {
      name: "phonenowithcc",
      regExp: /\+(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\W*\d\W*\d\W*\d\W*\d\W*\d\W*\d\W*\d\W*\d\W*(\d{1,3})$/,
      message: "Invalid Phone Number with country code"
  },
  {
      name: "email",
      regExp: /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/i,
      message: "Invalid Email Address"
  },
  {
      name: "password",
      regExp: /^[0-9a-zA-Z@#]{6,30}$/i,
      message:"password accepts only alphabets and number of range 6-30 length"
  },
  {
      name: "confirmpassword",
      regExp: /^[0-9a-zA-Z@#]{6,30}$/i,
      message: "Passwords don't match"
  }, 
  {
      name: "name",
      regExp: /^[a-zA-z]{3,25}$/i,
      message: "Name required with a range 3-25 characters "
  }
];
