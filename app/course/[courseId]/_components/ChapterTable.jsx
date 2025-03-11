// filepath: /c:/Users/KwaNdlovu/Desktop/Career/Revolution/quiz/reducate-quiz/app/course/[courseId]/notes/_components/ChapterTable.jsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

function ChapterTable({ chapters, onChapterClick }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">Chapter</TableHead>
                    <TableHead>Title</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {chapters.map((chapter, index) => (
                    <TableRow 
                        key={chapter.chapterId}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => onChapterClick(chapter, index)}
                    >
                        <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                                <span>{chapter.emoji}</span>
                                <span>{index + 1}</span>
                            </div>
                        </TableCell>
                        <TableCell>{chapter?.chapter_title}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default ChapterTable