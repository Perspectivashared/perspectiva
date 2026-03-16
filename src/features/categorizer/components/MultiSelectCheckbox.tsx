import {
  FormControl,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

interface MultiSelectCheckboxProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
}

const MultiSelectCheckbox = ({
  label,
  value,
  onChange,
}: MultiSelectCheckboxProps) => {
  const checked = value.includes(label);

  return (
    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
      <FormControl>
        <Checkbox
          checked={checked}
          onCheckedChange={(nextChecked) => {
            if (nextChecked) {
              onChange([...value, label]);
              return;
            }

            onChange(value.filter((item) => item !== label));
          }}
        />
      </FormControl>
      <FormLabel className="font-normal">{label}</FormLabel>
    </FormItem>
  );
};

export default MultiSelectCheckbox;
