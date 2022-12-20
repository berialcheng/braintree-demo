

export default function handler(req, res) {
    console.log("req.query", req.query)

    if (req.body && req.body.notificationItems) {
        var notificationItems = req.body.notificationItems;
        notificationItems.map(n => {
            return n
        })
    }

    console.log("req.body", req.body)
    res.status(200).json({'response': '[accepted]'})
}