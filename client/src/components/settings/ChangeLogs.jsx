import React, { useState, version } from "react";
import PostTopBar from "../PostTopBar";
import { Icon } from "../../utils/icons";
import { motion } from "framer-motion";

const ChangeLogs = () => {
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
      subVersions: [
        {
          version: "1.1.1",
          details: [
            "Minor bug fixes in stories.",
            "Story load performance enhancements.",
          ],
        },
        {
          version: "1.1.2",
          details: [
            "Minor bug fixes in stories.",
            "Added Account Deactivation in the personal Details.",
          ],
        },
        {
          version: "1.1.3",
          details: ["Added account deletion"],
        },
      ],
    },
    {
      version: "1.2.0",
      details: ["Added an Account Setup functionality after the signup."],
    },
    {
      version: "1.3.0",
      details: [
        "Added a Chatting functionality.",
        "Now You can send the message to users.",
      ],
    },
  ];

  const [openVersion, setOpenVersion] = useState(null);
  const [openSubVersion, setOpenSubVersion] = useState(null);

  const toggleAccordion = (version) => {
    setOpenVersion(openVersion === version ? null : version);
    setOpenSubVersion(null);
  };

  const toggleSubAccordion = (subVersion) => {
    setOpenSubVersion(openSubVersion === subVersion ? null : subVersion);
  };

  return (
    <div className="min-h-screen">
      <PostTopBar title={"Change Logs"} />
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

                  {/* Sub-Versions */}
                  {versionData.subVersions &&
                    versionData.subVersions.map((sub, idx) => (
                      <div
                        key={idx}
                        className="mt-4 ml-4 border-l-2 border-gray-300 pl-4"
                      >
                        <div
                          className="flex items-center justify-between cursor-pointer py-2"
                          onClick={() => toggleSubAccordion(sub.version)}
                        >
                          <h4 className="text-lg font-semibold">
                            Version {sub.version}
                          </h4>
                          <motion.div
                            initial={{ rotate: 0 }}
                            animate={{
                              rotate: openSubVersion === sub.version ? 180 : 0,
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <Icon.ArrowDown
                              size={18}
                              className="text-gray-600"
                            />
                          </motion.div>
                        </div>

                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{
                            opacity: openSubVersion === sub.version ? 1 : 0,
                            height: openSubVersion === sub.version ? "auto" : 0,
                          }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <ul className="list-disc pl-5 text-base">
                            {sub.details.map((d, j) => (
                              <li key={j}>{d}</li>
                            ))}
                          </ul>
                        </motion.div>
                      </div>
                    ))}
                </div>
              )}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChangeLogs;
