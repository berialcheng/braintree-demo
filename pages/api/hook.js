

export default function handler(req, res) {
    console.log(req.query)
    console.log(req.body)
    res.status(200).json({'response': ['accepted']});
}