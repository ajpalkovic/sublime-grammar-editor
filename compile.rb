File.open('index.html', 'rb') do |file|
  contents = file.read

  contents = contents.gsub(/<link.*href='([^']+)'.*\/>/) do |match|
    File.open($1, 'rb') do |includeFile|
      "<style>#{includeFile.read}</style>"
    end
  end

  contents = contents.gsub(/<script.*src='([a-zA-Z_0-9.]+)'.*><\/script>/) do |match|
    File.open($1, 'rb') do |includeFile|
      "<script>#{includeFile.read}</script>"
    end
  end

  views = Dir.glob('*.haml').map do |filename|
    includeContents = ''
    File.open(filename, 'rb') do |includeFile|
      includeContents = includeFile.read
    end
    includeContents = includeContents.gsub(/'/, "\\\\'").gsub(/\n/, "\\n")
    name = filename.split('.')[0]
    "$.views.#{name} = new HamlView('#{name}', '#{includeContents}');"
  end.join("\n")
  code = "
  <script>
    $.compiled = true;
    $.views = {};
    #{views}
  </script>"
  contents[contents.index('<!-- settings -->'), '<!-- settings -->'.size] = code

  File.open('index.min.html', 'wb') do |minFile|
    minFile.write contents
  end
end
