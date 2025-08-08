<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HistoryTableResourceDaitsu extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'cas' => $this->cas,
            'reg_2' => $this->reg_2,
            'reg_4' => $this->reg_4,
            'reg_100' => $this->reg_100,
            'reg_101' => $this->reg_101,
            'reg_104' => $this->reg_104,
            'reg_105' => $this->reg_105,
            'reg_106' => $this->reg_106,
            'reg_107' => $this->reg_107,
            'reg_108' => $this->reg_108,
            'reg_109' => $this->reg_109,
            'reg_110' => $this->reg_110,
            'reg_111' => $this->reg_111,
            'reg_112' => $this->reg_112,
            'reg_113' => $this->reg_113,
            'reg_115' => $this->reg_115,
            'reg_124' => $this->reg_124,
            'reg_128_1' => $this->reg_128_1,
            'reg_128_4' => $this->reg_128_4,
            'reg_128_6' => $this->reg_128_6,
            'reg_129_0' => $this->reg_129_0,
            'reg_129_2' => $this->reg_129_2,
            'reg_129_13' => $this->reg_129_13,
            'reg_129_14' => $this->reg_129_14,
            'reg_136' => $this->reg_136,
            'reg_137' => $this->reg_137,
            'reg_138' => $this->reg_138,
            'reg_140' => $this->reg_140,
        ];
    }
}