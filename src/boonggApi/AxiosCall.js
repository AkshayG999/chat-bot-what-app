const axios = require('axios')
require('dotenv')

// Get City List 
const cityList = async () => {
    try {
        const list = await axios.get(`${process.env.BOONGG_URL}/city/list`,
            {},
            {
                headers: {
                    'Authorization': process.env.AUTH_TOKEN
                }
            }
        )
        return list

    } catch (err) {
        console.log(err)
    }
}

// Get Locations List By City Name
const locality = async (CityName) => {
    try {
        const list = await axios.get(`${process.env.BOONGG_URL}/locality/${CityName}?token=${process.env.AUTH_TOKEN}`,
            {},
            {
                headers: {
                    "Authorization": process.env.AUTH_TOKEN

                }
            }
        )
        return list

    } catch (err) {
        console.log(err)
    }
}
// Get User By mobile Number
const getWebUser = async (mobileNumber) => {
    try {

        return await axios.get(`${process.env.BOONGG_DEV_URL}/getwebuser/${mobileNumber}`)

    } catch (err) {
        console.log(err)
    }
}

// get All stores
const getStoreUser = async (location, cityId) => {
    try {
        let allStoresList = await axios.get(`${process.env.BOONGG_DEV_URL}/stores`,
            {},
            {
                headers: {
                    "Authorization": process.env.AUTH_TOKEN

                }
            }
        )

        if (cityId) {

            let storeData = allStoresList.data.filter((item) => item._city._id == cityId);
            // console.log(storeData)
            return storeData

        } else {

            let regex = new RegExp(location, "i"); // "i" flag makes the regex case-insensitive
            let storeData = allStoresList.data.filter((item) => {
                return regex.test(item.locality);
            });

            console.log("store list=", storeData)

            if (storeData == 0) {

                return [{ "mobileNumber": "8432113333" }]
            }

            return await getStoreAdmin(storeData[0]._id)
        }

    } catch (err) {
        console.log(err)
    }

}

const getStoreAdmin = async (_storeKey) => {
    try {
        console.log("store Key=", _storeKey)

        let storeUsers = await axios.get(`${process.env.BOONGG_URL}/users/store/${_storeKey}`,
            {},
            {
                headers: {
                    "Authorization": process.env.AUTH_TOKEN

                }
            }
        )

        console.log("store Users/admin", storeUsers.data)

        if (storeUsers.data.length == 0) {
            return [{ "mobileNumber": "8432113333" }]
        }

        let store_admin = storeUsers.data.filter((user) => user.role === 'STORE_ADMIN')

        if (store_admin.length == 0 || !store_admin[0].mobileNumber) {
            store_admin = storeUsers.data.filter((user) => user.role === 'STORE_USER')
        }

        return store_admin

    } catch (err) {
        console.log(err)
    }

}

const rentbookings = async (webuserId, bookingType) => {
    try {
        // 632c6a4dd43df6d71183a76b
        let bookingsData = await axios.post(`${process.env.BOONGG_DEV_URL}/rentbooking/forWebUser`,
            {
                "webUserId": webuserId
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": process.env.AUTH_TOKEN
                }
            }
        )
        // console.log(bookingsData.data.bookings)

        if (bookingsData.data.bookings.length == 0) {
            return []
        }

        const rides = [];
        bookingsData.data.bookings.forEach(b => {
            if (b.status === bookingType) {

                // const startDate = new Date(b.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date(b.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                // const endDate = new Date(b.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date(b.endDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

                const startDate = new Date(b.startDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'short', day: '2-digit', hour: 'numeric', minute: '2-digit', hour12: true });
                const endDate = new Date(b.endDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'short', day: '2-digit', hour: 'numeric', minute: '2-digit', hour12: true });


                let obj = {
                    'Booking_ID': b.boonggBookingId,
                    'Type_of_bike': b.model,
                    'Pickup_Date_and_Time': startDate,
                    'Drop_Date_and_Time': endDate,
                    'Booking_Amount': b.rentTotal,
                    'storeKey': b._storeKey._id
                }
                rides.push(obj);
            }
        })
        console.log("Ride=", rides)

        if (rides.length == 0) {
            return []
        }

        if (bookingType == 'BOOKED') {

            const currentTime = new Date();
            //  upcoming ride based on the current time
            const firstRides = rides.filter(booking => new Date(booking['Pickup_Date_and_Time']) > currentTime);

            firstRides.sort((a, b) => new Date(a['Pickup_Date_and_Time']) - new Date(b['Pickup_Date_and_Time']));
            console.log("ride upcoming=", firstRides)
            return firstRides;

        } else if (bookingType == 'COMPLETED') {

            rides.sort((a, b) => new Date(b['Drop_Date_and_Time']) - new Date(a['Drop_Date_and_Time']));
            console.log("ride previous=", rides[0])
            return rides;

        } else if (bookingType == 'ONGOING') {

            const currentTime = new Date();
            //  ONGOING ride based on the current time
            const firstRides = rides.filter(booking => new Date(booking['Drop_Date_and_Time']) > currentTime);

            firstRides.sort((a, b) => new Date(a['Pickup_Date_and_Time']) - new Date(b['Pickup_Date_and_Time']));
            console.log("ride current=", firstRides)
            return firstRides;
        }

    } catch (err) {
        console.log(err)
        return []
    }

}

module.exports = { cityList, locality, getWebUser, getStoreUser, getStoreAdmin, rentbookings }


