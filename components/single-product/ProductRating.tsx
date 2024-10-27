import { FaStar } from 'react-icons/fa';

const ProductRating = ({ productId }: { productId: string }) => {
  // temp
  const rating = 4.2;
  const count = 25;
  console.log(productId);

  const className = `flex gap-1 items-center text-md mt-1 mb-4`;
  const countValue = `(${count})`;

  return (
    <span className={className}>
      <FaStar className="w-3 h-3" />
      {rating} {countValue}
    </span>
  );
};
export default ProductRating;
