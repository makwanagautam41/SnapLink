import axios from "axios";
import validator from "validator";

const users = [
  {
    name: "Nikhil",
    username: "nikhil_gupta",
    email: "nikhil.gupta@gmail.com",
    password: "N!K#Gv82$p@X",
    phone: "9098765123",
    bio: "Blockchain Developer and Crypto Enthusiast.",
    gender: "male",
  },
  {
    name: "Ananya",
    username: "ananya_r",
    email: "ananya.r@gmail.com",
    password: "Ana@2024$#",
    phone: "9876543210",
    bio: "UI/UX designer who loves minimalist aesthetics.",
    gender: "female",
  },
  {
    name: "Rohan",
    username: "rohan.dev",
    email: "rohan.dev@yahoo.com",
    password: "R0h@n$DeV95",
    phone: "9123456789",
    bio: "Full-stack dev. Coffee fuels my code.",
    gender: "male",
  },
  {
    name: "Meera",
    username: "meeratheexplorer",
    email: "meera.xplorer@gmail.com",
    password: "M3e@#explore!",
    phone: "9988776655",
    bio: "Travel blogger and amateur photographer.",
    gender: "female",
  },
  {
    name: "Arjun",
    username: "arjun.codes",
    email: "arjun.codes@hotmail.com",
    password: "C0d3$Arj!n",
    phone: "9654123789",
    bio: "Web3 developer. Working on decentralized dreams.",
    gender: "male",
  },
  {
    name: "Sanya",
    username: "sanya.lens",
    email: "sanya.photog@gmail.com",
    password: "SnY@#lens24",
    phone: "9786543211",
    bio: "Photographer | Capturing moments forever.",
    gender: "female",
  },
  {
    name: "Karan",
    username: "karan_fitlife",
    email: "karan.fitness@gmail.com",
    password: "K4r@#nfit$$",
    phone: "9001234567",
    bio: "Fitness freak. Protein, Pump, Repeat.",
    gender: "male",
  },
  {
    name: "Priya",
    username: "priya.art",
    email: "priya.artworks@gmail.com",
    password: "Pr!Y#Art33",
    phone: "9011223344",
    bio: "Painter. Dreaming in colors.",
    gender: "female",
  },
  {
    name: "Aman",
    username: "aman_gamer",
    email: "aman.gamer@gmail.com",
    password: "Am@n#playz1",
    phone: "9223344556",
    bio: "Competitive gamer. Streamer. Clutch master.",
    gender: "male",
  },
  {
    name: "Ishita",
    username: "ishita.writes",
    email: "ishita.writer@gmail.com",
    password: "I$hiT@Pen#20",
    phone: "9090112233",
    bio: "Poet & storyteller. Words are my world.",
    gender: "female",
  },
  {
    name: "Dev",
    username: "dev_innovates",
    email: "dev.techy@gmail.com",
    password: "D3v!@tech2025",
    phone: "9134567890",
    bio: "Tech entrepreneur. Passionate about AI.",
    gender: "male",
  },
  {
    name: "Sneha",
    username: "sneha_vibes",
    email: "sneha.vibes@gmail.com",
    password: "Sneh@#456v!",
    phone: "9870123456",
    bio: "Lifestyle influencer. Positivity always.",
    gender: "female",
  },
  {
    name: "Yash",
    username: "yash_travels",
    email: "yash.travel@gmail.com",
    password: "Y@sh#tra2023",
    phone: "9112345678",
    bio: "Globe-trotter. Mountains > Wi-Fi.",
    gender: "male",
  },
  {
    name: "Riya",
    username: "riya_foodie",
    email: "riya.foodie@gmail.com",
    password: "Riy@Yum$$33",
    phone: "9887766554",
    bio: "Food lover. Exploring one bite at a time.",
    gender: "female",
  },
  {
    name: "Manav",
    username: "manav.invests",
    email: "manav.invests@gmail.com",
    password: "Mn@v#fin42$",
    phone: "9345678901",
    bio: "Finance nerd. Stocks & crypto.",
    gender: "male",
  },
  {
    name: "Tanya",
    username: "tanya.doodles",
    email: "tanya.doodle@gmail.com",
    password: "T@nY#draw!z",
    phone: "9234567812",
    bio: "Digital artist | Doodles speak louder.",
    gender: "female",
  },
  {
    name: "Rajat",
    username: "rajat.codes",
    email: "rajat.dev@gmail.com",
    password: "RaJ@#2024cd",
    phone: "9123890123",
    bio: "Software Engineer. Bugs fear me.",
    gender: "male",
  },
  {
    name: "Neha",
    username: "neha.books",
    email: "neha.reads@gmail.com",
    password: "N3h@Books*88",
    phone: "9456123890",
    bio: "Bookworm | Escaping reality one page at a time.",
    gender: "female",
  },
  {
    name: "Varun",
    username: "varun.vlogs",
    email: "varun.vlogs@gmail.com",
    password: "Var@#vlogz77",
    phone: "9345213987",
    bio: "Vlogger | Moments in motion.",
    gender: "male",
  },
  {
    name: "Divya",
    username: "divya.yoga",
    email: "divya.yoga@gmail.com",
    password: "D!vy@Yoga@33",
    phone: "9876123450",
    bio: "Yoga instructor | Balance, breath, bliss.",
    gender: "female",
  },
];

const SERVER_URL = "http://localhost:4000/api/users/signup";

const seedUsers = async () => {
  for (const user of users) {
    try {
      if (!validator.isEmail(user.email)) {
        console.log(`❌ Invalid email: ${user.email}`);
        continue;
      }

      if (!validator.isStrongPassword(user.password)) {
        console.log(`❌ Weak password for ${user.username}`);
        continue;
      }

      const response = await axios.post(SERVER_URL, user);
      console.log(
        `✅ Created user: ${user.username} (Token: ${response.data.token})`
      );
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message;
      console.log(`❌ Error creating ${user.username}: ${errMsg}`);
    }
  }
};

seedUsers();
