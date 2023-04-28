const WhatsAppSession = require('../models/whatsAppSchema')
const { listMessageSend, sendMessageTemplate } = require('../sendReplyApi/whatsAppApi')
const { getWebUser, getStoreAdmin, rentbookings } = require('../boonggApi/AxiosCall');
const { startTimer, stopTimer } = require('../timerReply/timerReply')



const buttonReply = async (messages) => {
    try {

        console.log(messages[0])
        const { from, button } = messages[0]

        if (button.payload == 'Book a Bike') {
            stopTimer()
            const userChatData = await WhatsAppSession.findOne({ mobileNumber: from.slice(2, 12) })
            // console.log("user data", userChatData, userChatData.button)

            if (userChatData && userChatData.button === 'false') {
                await WhatsAppSession.findOneAndUpdate({ mobileNumber: from.slice(2, 12) }, { button: button.payload }, { new: true })
            }

            const userCheck = await getWebUser(from.slice(2, 12))

            if (userCheck.data.length > 0) {
                const component = [
                    {
                        "type": "body",
                        "parameters": [
                            {
                                "type": "text",
                                "text": userCheck.data[0].profile.name
                            },
                        ]
                    }
                ]
                await sendMessageTemplate("bike_book", from, component)
                return;

            } else {

                await sendMessageTemplate("button_book_now_more_query_noname", from)
                return;
            }


        } else if (button.payload == 'Book Now?') {
            stopTimer()
            const userChatData = await WhatsAppSession.findOne({ mobileNumber: from.slice(2, 12) })
            const cityName = userChatData.cityReply[0].title
            const locationName = userChatData.locationReply[0].title
            // console.log(cityName, locationName)

            const UTCconverter = (date) => {
                let newDate = Date.UTC(
                    date.getUTCFullYear(),
                    date.getUTCMonth(),
                    date.getUTCDate(),
                    date.getUTCHours(),
                    date.getUTCMinutes(),
                    0
                );
                return newDate;
            };

            let startDate, startUTC, endDate, endUTC;

            if (new Date().getHours() < 9) {
                startDate = new Date();
                startDate.setHours(9, 0, 0, 0);
                endDate = new Date();
                endDate.setHours(15, 0, 0, 0);
                startUTC = UTCconverter(startDate);
                endUTC = UTCconverter(endDate);
                console.log("startDate1:", startUTC)
                console.log("endDate1:", endUTC)
            } else if (new Date().getHours() >= 20) {
                startDate = new Date();
                startDate.setDate(startDate.getDate() + 1);
                startDate.setHours(9, 0, 0, 0);
                endDate = new Date();
                endDate.setDate(endDate.getDate() + 1);
                endDate.setHours(15, 0, 0, 0);
                startUTC = UTCconverter(startDate);
                endUTC = UTCconverter(endDate);
                console.log("startDate2:", startUTC)
                console.log("endDate2:", endUTC)
            } else if (new Date().getHours() >= 15) {
                startDate = new Date();
                startDate.setHours(startDate.getHours() + 1, 0, 0, 0);
                endDate = new Date();
                endDate.setHours(21, 0, 0, 0);
                startUTC = UTCconverter(startDate);
                endUTC = UTCconverter(endDate);
                console.log("startDate3:", startUTC)
                console.log("endDate3:", endUTC)
            } else {
                startDate = new Date();
                startDate.setHours(startDate.getHours() + 1, 0, 0, 0);
                endDate = new Date();
                // endDate.setHours(startDate.getHours() + 7, 0, 0, 0);
                endDate.setHours(endDate.getHours() + 7, 0, 0, 0); // subtract one hour
                startUTC = UTCconverter(startDate);
                endUTC = UTCconverter(endDate);
            }

            console.log("startDate:", startUTC)
            console.log("endDate:", endUTC)

            const urlString = `/${cityName}/any/any/${locationName}/${startUTC}/${endUTC}/Asia/Calcutta`;
            const parsedUrl = new URL(urlString, 'https://boongg.com/Search');
            const pathname = parsedUrl.pathname;

            console.log("path", pathname);

            const component = [
                {
                    "type": "button",
                    "sub_type": "url",
                    "index": "0",
                    "parameters": [
                        {
                            "type": "text",
                            "text": pathname
                        }
                    ]
                },
            ];


            await sendMessageTemplate("redirect_link_web_app", from, component)
            // setTimeout(async () => { await sendMessageTemplate("last_conclusion_message", from) }, 15000);
            startTimer(from)
            return;

        } else if (button.payload == 'My Bookings') {

            await sendMessageTemplate("my_bookings_button", from)
            return;

        } else if (button.payload == 'Current Booking') {
            stopTimer()
            const userCheck = await getWebUser(from.slice(2, 12))

            let bookingDetails = await rentbookings(userCheck.data[0]._id, "ONGOING")

            // No Any Booking Found
            if (bookingDetails.length == 0) {
                console.log("no Current/ONGOING booking")

                const component = [
                    {
                        "type": "body",
                        "parameters": [
                            {
                                "type": "text",
                                "text": "Current"
                            }
                        ]
                    }
                ]
                sendMessageTemplate('you_dont_have_booking', from, component)
                return;
            }

            const component = [
                {
                    "type": "body",
                    "parameters": [
                        {
                            "type": "text",
                            "text": bookingDetails[0].Booking_ID
                        },
                        {
                            "type": "text",
                            "text": bookingDetails[0].Type_of_bike
                        },
                        {
                            "type": "text",
                            "text": bookingDetails[0].Pickup_Date_and_Time
                        },
                        {
                            "type": "text",
                            "text": bookingDetails[0].Drop_Date_and_Time
                        },
                        {
                            "type": "text",
                            "text": bookingDetails[0].Booking_Amount ? bookingDetails[0].Booking_Amount + ".00" : "0.00"
                        }
                    ]
                }
            ]
            await sendMessageTemplate('current_booking_details', from, component)
            return;

        } else if (button.payload == 'Upcoming Booking') {
            stopTimer()
            const userCheck = await getWebUser(from.slice(2, 12))

            let bookingDetails = await rentbookings(userCheck.data[0]._id, "BOOKED")

            // No Any Booking Found
            if (bookingDetails.length == 0) {
                console.log("no Upcoming/Feature booking data")

                const component = [
                    {
                        "type": "body",
                        "parameters": [
                            {
                                "type": "text",
                                "text": "Upcoming"
                            }
                        ]
                    }
                ]

                sendMessageTemplate('you_dont_have_booking', from, component)
                return;
            }

            const component = [
                {
                    "type": "body",
                    "parameters": [
                        {
                            "type": "text",
                            "text": bookingDetails[0].Booking_ID
                        },
                        {
                            "type": "text",
                            "text": bookingDetails[0].Type_of_bike
                        },
                        {
                            "type": "text",
                            "text": bookingDetails[0].Pickup_Date_and_Time
                        },
                        {
                            "type": "text",
                            "text": bookingDetails[0].Drop_Date_and_Time
                        },
                        {
                            "type": "text",
                            "text": bookingDetails[0].Booking_Amount ? bookingDetails[0].Booking_Amount + ".00" : "0.00"
                        }
                    ]
                }
            ]
            await sendMessageTemplate('upcoming_booking', from, component)
            return;

        } else if (button.payload == 'Previous Booking') {
            stopTimer()
            const userCheck = await getWebUser(from.slice(2, 12))
            console.log("webUserID", userCheck.data[0]._id)

            let bookingDetails = await rentbookings(userCheck.data[0]._id, "COMPLETED")

            // No Any Booking Found
            if (bookingDetails.length == 0) {

                console.log("no booking data")
                sendMessageTemplate('no_previous_booking', from)
                return;
            }

            const component = [
                {
                    "type": "body",
                    "parameters": [
                        {
                            "type": "text",
                            "text": bookingDetails[0].Booking_ID ? bookingDetails[0].Booking_ID : "NA"
                        },
                        {
                            "type": "text",
                            "text": bookingDetails[0].Type_of_bike
                        },
                        {
                            "type": "text",
                            "text": bookingDetails[0].Pickup_Date_and_Time
                        },
                        {
                            "type": "text",
                            "text": bookingDetails[0].Drop_Date_and_Time
                        },
                        {
                            "type": "text",
                            "text": bookingDetails[0].Booking_Amount ? bookingDetails[0].Booking_Amount + ".00" : "0.00"
                        }
                    ]
                }
            ]

            await sendMessageTemplate('preivous_booking_details', from, component)

            await sendMessageTemplate('more_previous_bookings', from)

            // setTimeout(async () => { await sendMessageTemplate("last_conclusion_message", from) }, 15000);
            startTimer(from)
            return;

        } else if (button.payload == 'Early Drop') {
            stopTimer()
            const userCheck = await getWebUser(from.slice(2, 12))
            console.log("webUser", userCheck.data[0])

            let bookingDetails = await rentbookings(userCheck.data[0]._id, "ONGOING")
            console.log("BookingDetails=", bookingDetails)

            let storeAdmin = await getStoreAdmin(bookingDetails[0].storeKey)

            console.log("store admin=", storeAdmin)

            const component = [
                {
                    "type": "body",
                    "parameters": [
                        {
                            "type": "text",
                            "text": storeAdmin[0].mobileNumber
                        }
                    ]
                }
            ]

            await sendMessageTemplate('early_extend_drop', from, component)
            // setTimeout(async () => { await sendMessageTemplate("last_conclusion_message", from) }, 15000);
            startTimer(from)
            return;

        } else if (button.payload == 'Extend Drop') {
            stopTimer()
            const userCheck = await getWebUser(from.slice(2, 12))
            console.log("webUser", userCheck.data[0])

            let bookingDetails = await rentbookings(userCheck.data[0]._id, "ONGOING")
            console.log("BookingDetails=", bookingDetails)

            let storeAdmin = await getStoreAdmin(bookingDetails[0].storeKey)

            console.log("store admin=", storeAdmin)

            const component = [
                {
                    "type": "body",
                    "parameters": [
                        {
                            "type": "text",
                            "text": storeAdmin[0].mobileNumber
                        }
                    ]
                }
            ]

            await sendMessageTemplate('exdend_drop', from, component)
            // setTimeout(async () => { await sendMessageTemplate("last_conclusion_message", from) }, 15000);
            startTimer(from)
            return;

        } else if (button.payload == 'Cancel Booking') {
            stopTimer()
            const userCheck = await getWebUser(from.slice(2, 12))
            console.log("webUser", userCheck.data[0])

            let bookingDetails = await rentbookings(userCheck.data[0]._id, "BOOKED")
            console.log("BookingDetails=", bookingDetails)

            let storeAdmin = await getStoreAdmin(bookingDetails[0].storeKey)

            console.log("store admin=", storeAdmin)
            const component = [
                {
                    "type": "body",
                    "parameters": [
                        {
                            "type": "text",
                            "text": storeAdmin[0].mobileNumber
                        }
                    ]
                }
            ]

            await sendMessageTemplate('cancel_booking', from, component)
            // setTimeout(async () => { await sendMessageTemplate("last_conclusion_message", from) }, 15000);
            startTimer(from)
            return;

        } else if (button.payload == 'Change Pickup Date & Time') {
            stopTimer()
            const userCheck = await getWebUser(from.slice(2, 12))
            console.log("webUser", userCheck.data[0])

            let bookingDetails = await rentbookings(userCheck.data[0]._id, "BOOKED")
            console.log("BookingDetails=", bookingDetails)

            let storeAdmin = await getStoreAdmin(bookingDetails[0].storeKey)

            console.log("store admin=", storeAdmin)

            const component = [
                {
                    "type": "body",
                    "parameters": [
                        {
                            "type": "text",
                            "text": storeAdmin[0].mobileNumber
                        }
                    ]
                }
            ]

            await sendMessageTemplate('change_pickup_date_time', from, component)
            // setTimeout(async () => { await sendMessageTemplate("last_conclusion_message", from) }, 15000);
            startTimer(from)
            return;


        } else if (button.payload == 'Any Other Queries (FAQ)' || button.payload == 'Have more Queries?') {
            stopTimer()
            await sendMessageTemplate("any_other_query_faq", from)
            return;

        } else if (button.payload == 'Payment') {
            stopTimer()
            await sendMessageTemplate("how_do_make_payment", from)
            return;

        } else if (button.payload == 'How do I make Payments?') {
            stopTimer()
            await sendMessageTemplate("payment_acceptance", from)
            // setTimeout(async () => { await sendMessageTemplate("last_conclusion_message", from) }, 15000);
            startTimer(from)
            return;

        } else if (button.payload == 'Booking') {
            stopTimer()
            const listInteractiveObject = {
                type: "list",
                body: {
                    text: "Please select from the options given below",
                },
                action: {
                    button: "Drop Down List",
                    sections: [
                        {
                            title: "Choose Option",
                            rows: [
                                {
                                    id: "101",
                                    title: "Booking Procedure",

                                },
                                {
                                    id: "102",
                                    title: "Rescheduling Policy",
                                    description: "Booking Extension Policy"

                                },
                                {
                                    id: "103",
                                    title: "Cancellation Policy",
                                    description: "Cancellation and Refund Policy"
                                },
                                {
                                    id: "104",
                                    title: "Fuel Policy",

                                },
                            ],
                        },
                    ],
                }
            }

            let messageObject = {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: from,
                type: "interactive",
                interactive: listInteractiveObject,
            };

            await listMessageSend(messageObject) // Booking Query list 
            return;

        } else if (button.payload == 'Damage') {
            stopTimer()
            const listInteractiveObject = {
                type: "list",
                body: {
                    text: "Please select from the options given below",
                },
                action: {
                    button: "Drop Down List",
                    sections: [
                        {
                            title: "Choose Option",
                            rows: [
                                {
                                    id: "201",
                                    title: "Physical Damage",

                                },
                                {
                                    id: "202",
                                    title: "Bike Break down",
                                },
                                {
                                    id: "203",
                                    title: "Puncture Related issues",
                                },
                            ],
                        },
                    ],
                }
            }

            let messageObject = {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: from,
                type: "interactive",
                interactive: listInteractiveObject,
            };

            await listMessageSend(messageObject) // Booking Query list 
            return;

            // await sendMessageTemplate("damage_query__buttos", from)
            // return;

        } else if (button.payload == 'Accident/Physical Damage') {
            // this three Buttons converted into list 
        } else if (button.payload == 'Bike Break down') {

        } else if (button.payload == 'Puncture Related issues') {

        }
    } catch (err) {
        console.log(err)
    }

}

module.exports = { buttonReply }