line_number=5
file="index."
text="some text"

# Extract the line using sed and check if it contains the text
if sed -n "${line_number}p" "$file" | grep -q "$text"; then
  echo "Line $line_number contains the text."
else
  echo "Line $line_number does NOT contain the text."
fi
