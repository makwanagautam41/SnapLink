import React, { useState } from "react";
import PostTopBar from "../PostTopBar";
import { Icon } from "../../utils/icons";
import { motion } from "framer-motion";

const About = () => {
  const versions = [
    {
      version: "1.0.0",
      details: [
        "Initial build with login, registration, and user profiles.",
        "Basic post functionality with likes and comments.",
      ],
    },
    {
      version: "1.1.0",
      details: [
        "Added story feature with view counts.",
        "Improved UI for profile pages.",
        "Bug fixes and performance improvements.",
      ],
    },
  ];

  const [openVersion, setOpenVersion] = useState(null);

  const toggleAccordion = (version) => {
    setOpenVersion(openVersion === version ? null : version);
  };

  return (
    <div className="min-h-screen">
      <PostTopBar title={"About"} />
      <div className="px-4 py-6">
        <h2 className="text-3xl font-semibold mb-4">Welcome to SnapLink</h2>
        <p className="text-lg mb-4">
          This is a clone of Instagram built with the MERN stack, designed for
          learning purposes.
        </p>

        {versions.map((versionData, index) => (
          <div key={index} className="rounded-lg shadow-lg mb-4">
            <div
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => toggleAccordion(versionData.version)}
            >
              <h3 className="text-xl font-semibold">
                Version {versionData.version}
              </h3>

              <motion.div
                initial={{ rotate: 0 }}
                animate={{
                  rotate: openVersion === versionData.version ? 180 : 0,
                }}
                transition={{ duration: 0.3 }}
              >
                <Icon.ArrowDown size={20} className="text-gray-600" />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: openVersion === versionData.version ? 1 : 0,
                height: openVersion === versionData.version ? "auto" : 0,
              }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {openVersion === versionData.version && (
                <div className="p-4 border-t border-gray-200">
                  <ul className="list-disc pl-5 text-lg">
                    {versionData.details.map((detail, i) => (
                      <li key={i}>{detail}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;
