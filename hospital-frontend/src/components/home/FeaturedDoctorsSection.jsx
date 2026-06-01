import { Link } from 'react-router-dom';

const FeaturedDoctorsSection = ({ doctors }) => {
  const featuredDoctors = doctors.slice(0, 4);

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-4xl font-bold">Featured Doctors</h2>

        <p className="mt-3 text-center text-slate-500">
          Meet our experienced specialists
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featuredDoctors.map((doctor) => (
            <div
              key={doctor._id}
              className="rounded-3xl bg-white p-6 shadow-sm"
            >
              <img
                src={doctor.userId?.profilePicture}
                alt=""
                className="mx-auto h-24 w-24 rounded-full object-cover"
              />

              <h3 className="mt-4 text-center text-lg font-bold">
                Dr. {doctor.userId?.fullName}
              </h3>

              <p className="text-center text-sm text-slate-500">
                {doctor.department?.name}
              </p>

              <div className="mt-4 space-y-2 text-sm">
                <p>⭐ {doctor.averageRating}</p>

                <p>Experience: {doctor.experience} years</p>

                <p>Fee: ₹{doctor.consultationFee}</p>
              </div>

              <Link
                to={`/doctors/${doctor._id}`}
                className="mt-5 block rounded-2xl bg-blue-600 py-3 text-center text-white"
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedDoctorsSection;
