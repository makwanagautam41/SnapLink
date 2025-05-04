import axios from "axios";

const users = [
  {
    username: "nikhil_gupta",
    email: "nikhil.gupta@gmail.com",
    password: "N!K#Gv82$p@X",
  },
  {
    username: "ananya_r",
    email: "ananya.r@gmail.com",
    password: "Ana@2024$#",
  },
  {
    username: "rohan.dev",
    email: "rohan.dev@yahoo.com",
    password: "R0h@n$DeV95",
  },
  {
    username: "meeratheexplorer",
    email: "meera.xplorer@gmail.com",
    password: "M3e@#explore!",
  },
  {
    username: "arjun.codes",
    email: "arjun.codes@hotmail.com",
    password: "C0d3$Arj!n",
  },
  {
    username: "sanya.lens",
    email: "sanya.photog@gmail.com",
    password: "SnY@#lens24",
  },
  {
    username: "karan_fitlife",
    email: "karan.fitness@gmail.com",
    password: "K4r@#nfit$$",
  },
  {
    username: "priya.art",
    email: "priya.artworks@gmail.com",
    password: "Pr!Y#Art33",
  },
  {
    username: "aman_gamer",
    email: "aman.gamer@gmail.com",
    password: "Am@n#playz1",
  },
  {
    username: "ishita.writes",
    email: "ishita.writer@gmail.com",
    password: "I$hiT@Pen#20",
  },
];

const SERVER_URL = "http://localhost:4000/api/users";
const FOLLOW_USERNAME = "alphaxmg";

const sendFollowRequests = async () => {
  for (const user of users) {
    try {
      const loginRes = await axios.post(`${SERVER_URL}/signin`, {
        email: user.email,
        password: user.password,
      });

      const token = loginRes.data.token;

      const followRes = await axios.post(
        `${SERVER_URL}/follow/${FOLLOW_USERNAME}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(`✅ ${user.username} followed ${FOLLOW_USERNAME}`);
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message;
      console.log(`❌ ${user.username} failed to follow: ${errMsg}`);
    }
  }
};

sendFollowRequests();
