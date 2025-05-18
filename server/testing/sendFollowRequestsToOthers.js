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

const sendFollowRequests = async () => {
  try {
    const loginRes = await axios.post(`${SERVER_URL}/signin`, {
      email: "makwanagautam411@gmail.com",
      password: "gautamXalpha_416",
    });

    const token = loginRes.data.token;

    for (const user of users) {
      try {
        const followRes = await axios.post(
          `${SERVER_URL}/follow/${user.username}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(`✅ Gautammakwana followed ${user.username}`);
      } catch (error) {
        const errMsg = error.response?.data?.message || error.message;
        console.log(`❌ Failed to follow ${user.username}: ${errMsg}`);
      }
    }
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message;
    console.log(`❌ Failed to log in as gautammakwana: ${errMsg}`);
  }
};

sendFollowRequests();
