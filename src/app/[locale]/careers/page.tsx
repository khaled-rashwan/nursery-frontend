"use client";
import { useEffect, useState } from "react";
import { db } from "../../../firebase";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface JobListing {
  title: string;
  description: string;
}

interface HeroSection {
  title: string;
  subtitle: string;
  image: string;
}

interface CareersPageContent {
  heroSection: HeroSection;
  jobListings: JobListing[];
}

const CareersPage = () => {
  const [pageContent, setPageContent] = useState<CareersPageContent | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    jobTitle: "",
    resume: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchPageContent = async () => {
      try {
        const docRef = doc(db, "websiteContent", "careers");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPageContent(docSnap.data() as CareersPageContent);
        } else {
          setError("Careers page content not found.");
        }
      } catch (err) {
        setError("Failed to fetch page content.");
        console.error(err);
      }
    };
    fetchPageContent();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, resume: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.resume) {
      setError("Please upload a resume.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const storage = getStorage();
      const storageRef = ref(
        storage,
        `resumes/${Date.now()}_${formData.resume.name}`
      );
      const uploadTask = await uploadBytes(storageRef, formData.resume);
      const resumeUrl = await getDownloadURL(uploadTask.ref);

      const applicationData = {
        name: formData.name,
        email: formData.email,
        jobTitle: formData.jobTitle,
        resumeUrl: resumeUrl,
        submittedAt: new Date(),
      };

      const response = await fetch('/api/submitApplication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      setSuccess("Application submitted successfully!");
      setFormData({
        name: "",
        email: "",
        jobTitle: "",
        resume: null,
      });
      const resumeInput = document.getElementById("resume") as HTMLInputElement;
      if (resumeInput) {
        resumeInput.value = "";
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      setError("An error occurred while submitting the application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error && !pageContent) {
    return <div className="text-red-500 text-center p-8">{error}</div>;
  }

  if (!pageContent) {
    return <div className="text-center p-8">Loading...</div>;
  }

  const { heroSection, jobListings } = pageContent;

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-blue-600 text-white text-center p-12">
        <h1 className="text-5xl font-bold">{heroSection.title}</h1>
        <p className="text-xl mt-2">{heroSection.subtitle}</p>
      </header>

      <main className="container mx-auto p-8">
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            Open Positions
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobListings.map((job, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <h3 className="text-2xl font-bold text-blue-600">
                  {job.title}
                </h3>
                <p className="mt-2 text-gray-700">{job.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-center mb-8">Apply Now</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-gray-700 font-bold mb-2"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 font-bold mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="jobTitle"
                className="block text-gray-700 font-bold mb-2"
              >
                Job Title
              </label>
              <select
                id="jobTitle"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">Select a position</option>
                {jobListings.map((job, index) => (
                  <option key={index} value={job.title}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-6">
              <label
                htmlFor="resume"
                className="block text-gray-700 font-bold mb-2"
              >
                Upload Resume
              </label>
              <input
                type="file"
                id="resume"
                name="resume"
                onChange={handleFileChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            {error && (
              <p className="text-red-500 text-xs italic mb-4">{error}</p>
            )}
            {success && (
              <p className="text-green-500 text-xs italic mb-4">
                {success}
              </p>
            )}
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default CareersPage;
